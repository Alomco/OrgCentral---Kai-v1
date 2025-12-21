import { randomUUID } from 'node:crypto';
import { ValidationError } from '@/server/errors';
import { EntityNotFoundError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AcceptInvitationResult } from '@/server/use-cases/auth/accept-invitation';
import { acceptInvitation, type AcceptInvitationDependencies } from '@/server/use-cases/auth/accept-invitation';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { resolveIdentityCacheScopes } from '@/server/lib/cache-tags/identity';
import { invalidateCache } from '@/server/lib/cache-tags';
import type { MembershipStatus } from '@prisma/client';
import { MembershipStatus as PrismaMembershipStatus } from '@prisma/client';
import type { Membership } from '@/server/types/membership';
import { AbstractOrgService } from '@/server/services/org/abstract-org-service';
import { assertDependency } from '@/server/use-cases/shared';
import { updateMembershipRoles as updateMembershipRolesUseCase } from '@/server/use-cases/org/membership/update-membership-roles';
import { updateMembershipStatus as updateMembershipStatusUseCase } from '@/server/use-cases/org/membership/update-membership-status';
import { normalizeRoles } from '@/server/use-cases/shared';
import type { AbacSubjectAttributes } from '@/server/types/abac-subject-attributes';

export type MembershipServiceDependencies = AcceptInvitationDependencies;

const ORG_MEMBERSHIP_RESOURCE_TYPE = 'org.membership';

export interface AcceptInvitationServiceInput {
    token: string;
    actor: {
        userId: string;
        email: string;
    };
    correlationId?: string;
}

export class MembershipService extends AbstractOrgService {
    private readonly dependencies: MembershipServiceDependencies;

    constructor(dependencies: MembershipServiceDependencies) {
        super();
        this.dependencies = dependencies;
    }

    async acceptInvitation(input: AcceptInvitationServiceInput): Promise<AcceptInvitationResult> {
        const invitation = await this.dependencies.invitationRepository.findByToken(input.token.trim());
        if (!invitation) {
            throw new EntityNotFoundError('Invitation', { token: input.token });
        }

        const authorization = await this.buildAuthorizationContext(
            invitation.organizationId,
            input.actor.userId,
            input.correlationId,
        );

        const context: ServiceExecutionContext = this.buildContext(authorization, {
            correlationId: authorization.correlationId,
        });

        const deps: AcceptInvitationDependencies = {
            invitationRepository: this.dependencies.invitationRepository,
            userRepository: this.dependencies.userRepository,
            membershipRepository: this.dependencies.membershipRepository,
            organizationRepository: this.dependencies.organizationRepository,
            generateEmployeeNumber: this.dependencies.generateEmployeeNumber,
            employeeProfileRepository: this.dependencies.employeeProfileRepository,
            checklistTemplateRepository: this.dependencies.checklistTemplateRepository,
            checklistInstanceRepository: this.dependencies.checklistInstanceRepository,
        };

        return this.executeInServiceContext(context, 'identity.accept-invitation', () =>
            acceptInvitation(deps, input),
        );
    }

    async updateMembershipRoles(input: {
        authorization: RepositoryAuthorizationContext;
        targetUserId: string;
        roles: string[];
    }): Promise<Membership> {
        await this.ensureOrgAccess(input.authorization, {
            action: 'org.membership.update-roles',
            resourceType: ORG_MEMBERSHIP_RESOURCE_TYPE,
            resourceAttributes: {
                targetUserId: input.targetUserId,
                roles: input.roles,
            },
        });

        const context: ServiceExecutionContext = this.buildContext(input.authorization, {
            correlationId: input.authorization.correlationId,
            metadata: { targetUserId: input.targetUserId },
        });

        return this.executeInServiceContext(context, 'identity.update-roles', async () => {
            const { membership } = await updateMembershipRolesUseCase(
                { userRepository: this.dependencies.userRepository },
                {
                    authorization: input.authorization,
                    targetUserId: input.targetUserId,
                    roles: input.roles,
                },
            );
            await this.invalidateIdentityCache(input.authorization);
            return membership;
        });
    }

    async inviteMember(input: {
        authorization: RepositoryAuthorizationContext;
        email: string;
        roles: string[];
        abacSubjectAttributes?: AbacSubjectAttributes;
    }): Promise<{ token: string; alreadyInvited: boolean }> {
        await this.ensureOrgAccess(input.authorization, {
            action: 'org.invitation.create',
            resourceType: 'org.invitation',
            resourceAttributes: {
                email: input.email,
                roles: input.roles,
            },
            requiredPermissions: { member: ['invite'] },
        });

        const invitationRepository = this.dependencies.invitationRepository;
        const organizationRepository = this.dependencies.organizationRepository;
        assertDependency(invitationRepository, 'invitationRepository');

        const normalizedEmail = input.email.trim().toLowerCase();
        const roles = normalizeRoles(input.roles);

        const existing = await invitationRepository.getActiveInvitationByEmail(
            input.authorization.orgId,
            normalizedEmail,
        );

        if (existing) {
            return { token: existing.token, alreadyInvited: true };
        }

        const organization = await organizationRepository?.getOrganization(input.authorization.orgId);
        const organizationName = organization?.name ?? input.authorization.orgId;

        const context: ServiceExecutionContext = this.buildContext(input.authorization, {
            correlationId: input.authorization.correlationId,
            metadata: { email: normalizedEmail, roles },
        });

        return this.executeInServiceContext(context, 'identity.invite-member', async () => {
            if (!normalizedEmail) {
                throw new ValidationError('Email is required to invite a member.', { email: input.email });
            }

            const invitation = await invitationRepository.createInvitation({
                orgId: input.authorization.orgId,
                organizationName,
                targetEmail: normalizedEmail,
                invitedByUserId: input.authorization.userId,
                onboardingData: {
                    email: normalizedEmail,
                    displayName: '',
                    roles,
                    abacSubjectAttributes: input.abacSubjectAttributes,
                },
                metadata: {
                    auditSource: input.authorization.auditSource,
                    correlationId: input.authorization.correlationId,
                    dataResidency: input.authorization.dataResidency,
                    dataClassification: input.authorization.dataClassification,
                },
            });

            return { token: invitation.token, alreadyInvited: false };
        });
    }

    async suspendMembership(input: {
        authorization: RepositoryAuthorizationContext;
        targetUserId: string;
    }): Promise<void> {
        await this.ensureOrgAccess(input.authorization, {
            action: 'org.membership.suspend',
            resourceType: ORG_MEMBERSHIP_RESOURCE_TYPE,
            resourceAttributes: { targetUserId: input.targetUserId },
        });
        await this.updateMembershipStatus(
            { authorization: input.authorization, targetUserId: input.targetUserId, status: PrismaMembershipStatus.SUSPENDED },
        );
    }

    async resumeMembership(input: {
        authorization: RepositoryAuthorizationContext;
        targetUserId: string;
    }): Promise<void> {
        await this.ensureOrgAccess(input.authorization, {
            action: 'org.membership.resume',
            resourceType: ORG_MEMBERSHIP_RESOURCE_TYPE,
            resourceAttributes: { targetUserId: input.targetUserId },
        });
        await this.updateMembershipStatus(
            { authorization: input.authorization, targetUserId: input.targetUserId, status: PrismaMembershipStatus.ACTIVE },
        );
    }

    private async buildAuthorizationContext(
        orgId: string,
        userId: string,
        correlationId?: string,
    ): Promise<RepositoryAuthorizationContext> {
        const organization = await this.dependencies.organizationRepository?.getOrganization(orgId);
        const dataClassification: DataClassificationLevel =
            organization?.dataClassification ?? 'OFFICIAL';
        const dataResidency: DataResidencyZone = organization?.dataResidency ?? 'UK_ONLY';
        const auditSource = 'identity.accept-invitation';
        const correlation = correlationId ?? randomUUID();

        return {
            orgId,
            userId,
            roleKey: 'custom',
            permissions: {},
            dataResidency,
            dataClassification,
            auditSource,
            auditBatchId: undefined,
            correlationId: correlation,
            tenantScope: {
                orgId,
                dataResidency,
                dataClassification,
                auditSource,
                auditBatchId: undefined,
            },
        };
    }

    private async updateMembershipStatus(params: {
        authorization: RepositoryAuthorizationContext;
        targetUserId: string;
        status: MembershipStatus;
    }): Promise<void> {
        const { authorization, targetUserId, status } = params;
        const membershipRepository = this.dependencies.membershipRepository;
        assertDependency(membershipRepository, 'membershipRepository');

        const context: ServiceExecutionContext = this.buildContext(authorization, {
            correlationId: authorization.correlationId,
            metadata: { targetUserId, status },
        });

        await this.executeInServiceContext(context, 'identity.update-status', async () => {
            await updateMembershipStatusUseCase(
                { membershipRepository },
                { authorization, targetUserId, status },
            );
            await this.invalidateIdentityCache(authorization);
        });
    }

    private async invalidateIdentityCache(authorization: RepositoryAuthorizationContext): Promise<void> {
        const scopes = resolveIdentityCacheScopes();
        await Promise.all(
            scopes.map((scope) =>
                invalidateCache({
                    orgId: authorization.orgId,
                    scope,
                    classification: authorization.dataClassification,
                    residency: authorization.dataResidency,
                }),
            ),
        );
    }
}
