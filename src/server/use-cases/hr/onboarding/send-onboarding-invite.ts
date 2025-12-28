import { AuthorizationError, ValidationError } from '@/server/errors';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IOnboardingInvitationRepository } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared/validators';
import { normalizeRoles } from '@/server/use-cases/shared';
import { checkExistingOnboardingTarget } from './check-existing-onboarding-target';

export interface SendOnboardingInviteInput {
    authorization: RepositoryAuthorizationContext;
    email: string;
    displayName: string;
    employeeNumber: string;
    jobTitle?: string;
    employmentType?: string;
    eligibleLeaveTypes?: string[];
    onboardingTemplateId?: string | null;
    roles?: string[];
}

export interface SendOnboardingInviteDependencies {
    profileRepository: IEmployeeProfileRepository;
    invitationRepository: IOnboardingInvitationRepository;
    organizationRepository?: IOrganizationRepository;
}

export interface SendOnboardingInviteResult {
    token: string;
}

export async function sendOnboardingInvite(
    deps: SendOnboardingInviteDependencies,
    input: SendOnboardingInviteInput,
): Promise<SendOnboardingInviteResult> {
    if (input.authorization.roleKey !== 'hrAdmin') {
        throw new AuthorizationError('Only HR admins can invite employees.');
    }

    assertNonEmpty(input.email, 'email');
    assertNonEmpty(input.displayName, 'displayName');
    assertNonEmpty(input.employeeNumber, 'employeeNumber');

    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await checkExistingOnboardingTarget(
        {
            profileRepository: deps.profileRepository,
            invitationRepository: deps.invitationRepository,
        },
        {
            authorization: input.authorization,
            email: normalizedEmail,
        },
    );

    if (existing.exists) {
        throw new ValidationError('An onboarding target with this email already exists.', existing);
    }

    const organization = await deps.organizationRepository?.getOrganization(input.authorization.orgId);

    const roles = normalizeRoles(input.roles ?? []);
    if (roles.length > 0 && roles[0] !== 'member') {
        throw new ValidationError('Onboarding invitations may only assign the member role.');
    }

    const invitation = await deps.invitationRepository.createInvitation({
        orgId: input.authorization.orgId,
        organizationName: organization?.name ?? input.authorization.orgId,
        targetEmail: normalizedEmail,
        invitedByUserId: input.authorization.userId,
        onboardingData: {
            email: normalizedEmail,
            displayName: input.displayName,
            employeeId: input.employeeNumber,
            employmentType: input.employmentType ?? null,
            jobTitle: input.jobTitle ?? null,
            eligibleLeaveTypes: input.eligibleLeaveTypes ?? [],
            onboardingTemplateId: input.onboardingTemplateId ?? null,
            roles: roles.length > 0 ? roles : ['member'],
        },
    });

    return { token: invitation.token };
}
