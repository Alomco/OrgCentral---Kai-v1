import { MembershipStatus } from '@prisma/client';
import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IInvitationRepository } from '@/server/repositories/contracts/auth/invitations/invitation-repository-contract';
import type { InvitationRecord } from '@/server/repositories/contracts/auth/invitations/invitation-repository.types';
import type {
    IMembershipRepository,
    EmployeeProfilePayload,
    UserActivationPayload,
} from '@/server/repositories/contracts/org/membership';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { organizationToTenantScope } from '@/server/security/guards';
import type { OrganizationData } from '@/server/types/leave-types';
import {
    normalizeActor,
    normalizeToken,
    normalizeRoles,
    normalizeEmploymentType,
    assertEmailMatch,
    assertNotExpired,
    assertStatus,
    parseDate,
    buildAuthorizationContext,
    generateEmployeeNumber as defaultGenerateEmployeeNumber,
    type NormalizedActor,
    type EmploymentType,
} from '@/server/use-cases/shared';

export interface AcceptInvitationDependencies {
    invitationRepository: IInvitationRepository;
    userRepository: IUserRepository;
    membershipRepository?: IMembershipRepository;
    organizationRepository?: IOrganizationRepository;
    generateEmployeeNumber?: () => string;
}

export interface AcceptInvitationInput {
    token: string;
    actor: {
        userId: string;
        email: string;
    };
}

export interface AcceptInvitationResult {
    success: true;
    organizationId: string;
    organizationName: string;
    roles: string[];
    alreadyMember: boolean;
    employeeNumber?: string;
}

export async function acceptInvitation(
    deps: AcceptInvitationDependencies,
    input: AcceptInvitationInput,
): Promise<AcceptInvitationResult> {
    const token = normalizeToken(input.token);
    const actor = normalizeActor(input.actor);

    const record = await deps.invitationRepository.findByToken(token);
    if (!record) {
        throw new EntityNotFoundError('Invitation', { token });
    }

    assertInvitationCanBeAccepted(record, actor.email, token);

    const membershipRoles = resolveRoles(record);
    const membershipOutcome = await ensureMembershipAndOnboarding(deps, record, actor, membershipRoles);

    await deps.invitationRepository.updateStatus(token, {
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedByUserId: actor.userId,
    });

    return {
        success: true,
        organizationId: record.organizationId,
        organizationName: record.organizationName,
        roles: membershipRoles,
        alreadyMember: membershipOutcome.alreadyMember,
        employeeNumber: membershipOutcome.employeeNumber,
    };
}

function assertInvitationCanBeAccepted(record: InvitationRecord, actorEmail: string, token: string): void {
    assertStatus(record.status, 'pending', 'Invitation', { token });
    assertNotExpired(record.expiresAt, 'Invitation', { token });
    assertEmailMatch(
        actorEmail,
        record.targetEmail,
        'This invitation was issued to a different email address.',
    );
}

function resolveRoles(record: InvitationRecord): string[] {
    return normalizeRoles(record.onboardingData.roles);
}

interface MembershipOutcome {
    alreadyMember: boolean;
    employeeNumber?: string;
}

async function ensureMembershipAndOnboarding(
    deps: AcceptInvitationDependencies,
    record: InvitationRecord,
    actor: NormalizedActor,
    roles: string[],
): Promise<MembershipOutcome> {
    const existingUser = await deps.userRepository.getUser(record.organizationId, actor.userId);
    const alreadyMember = Boolean(existingUser?.memberOf?.includes(record.organizationId));

    if (alreadyMember) {
        return { alreadyMember: true };
    }

    if (deps.membershipRepository && deps.organizationRepository) {
        const context = await buildMembershipContext(
            deps.organizationRepository,
            record.organizationId,
            actor.userId,
        );
        const profilePayload = buildEmployeeProfilePayload(
            record,
            actor.userId,
            deps.generateEmployeeNumber ?? defaultEmployeeNumberGenerator,
        );
        const userUpdate = buildUserActivationPayload(record);

        await deps.membershipRepository.createMembershipWithProfile(context, {
            userId: actor.userId,
            invitedByUserId: record.invitedByUserId ?? record.invitedByUid,
            roles,
            profile: profilePayload,
            userUpdate,
        });

        return { alreadyMember: false, employeeNumber: profilePayload.employeeNumber };
    }

    await deps.userRepository.addUserToOrganization(
        record.organizationId,
        actor.userId,
        record.organizationId,
        record.organizationName,
        roles,
    );

    return { alreadyMember: false, employeeNumber: record.onboardingData.employeeId };
}

async function buildMembershipContext(
    organizationRepository: IOrganizationRepository,
    orgId: string,
    userId: string,
): Promise<RepositoryAuthorizationContext> {
    const organization = await organizationRepository.getOrganization(orgId);
    if (!organization) {
        throw new EntityNotFoundError('Organization', { orgId });
    }
    return mapOrganizationToContext(organization, userId);
}

function mapOrganizationToContext(
    organization: OrganizationData,
    userId: string,
): RepositoryAuthorizationContext {
    const tenantScope = organizationToTenantScope(organization);
    return buildAuthorizationContext({
        orgId: organization.id,
        userId,
        dataResidency: tenantScope.dataResidency,
        dataClassification: tenantScope.dataClassification,
        auditSource: 'accept-invitation',
        tenantScope,
    });
}

type EmployeeNumberGenerator = () => string;

function buildEmployeeProfilePayload(
    record: InvitationRecord,
    userId: string,
    generateEmployeeNumber: EmployeeNumberGenerator,
): EmployeeProfilePayload {
    const employmentTypeValue = normalizeEmploymentType(record.onboardingData.employmentType);
    return {
        orgId: record.organizationId,
        userId,
        employeeNumber: record.onboardingData.employeeId?.trim() || generateEmployeeNumber(),
        jobTitle: record.onboardingData.position ?? null,
        employmentType: employmentTypeValue as EmployeeProfilePayload['employmentType'],
        startDate: parseDate(record.onboardingData.startDate),
        metadata: {
            source: 'invitation-onboarding',
            templateId: record.onboardingData.onboardingTemplateId ?? null,
            payload: JSON.parse(JSON.stringify(record.onboardingData)),
        },
    };
}

function buildUserActivationPayload(record: InvitationRecord): UserActivationPayload {
    return {
        displayName: record.onboardingData.displayName ?? record.onboardingData.email,
        email: record.onboardingData.email ?? record.targetEmail,
        status: MembershipStatus.ACTIVE,
    };
}

function defaultEmployeeNumberGenerator(): string {
    return defaultGenerateEmployeeNumber();
}
