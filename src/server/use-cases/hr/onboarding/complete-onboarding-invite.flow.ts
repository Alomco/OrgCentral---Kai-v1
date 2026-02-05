import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { IMembershipRepository, EmployeeProfilePayload, UserActivationPayload } from '@/server/repositories/contracts/org/membership';
import type { BillingServiceContract } from '@/server/services/billing/billing-service.provider';
import { MembershipStatus } from '@/server/types/prisma';
import { parseDate } from '@/server/use-cases/shared';
import { instantiateOnboardingChecklist } from '@/server/use-cases/hr/people/create-employee-profile.helpers';
import { createEmploymentContract } from '@/server/use-cases/hr/people/employment/create-employment-contract';
import { getEmploymentContractByEmployee } from '@/server/use-cases/hr/people/employment/get-employment-contract-by-employee';
import type { buildChecklistConfig, buildContractData } from './complete-onboarding-invite.helpers';
import { createProfileDependencies, resolveRoles } from './complete-onboarding-invite.helpers';

export interface ExistingProfileHandlers {
  employmentContractRepository?: IEmploymentContractRepository;
  checklistTemplateRepository?: IChecklistTemplateRepository;
  checklistInstanceRepository?: IChecklistInstanceRepository;
  billingService?: BillingServiceContract;
  employeeProfileRepository: IEmployeeProfileRepository;
  membershipRepository: IMembershipRepository;
}

export async function handleExistingProfile(params: {
  deps: ExistingProfileHandlers;
  authorization: RepositoryAuthorizationContext;
  employeeNumber: string;
  contractData: ReturnType<typeof buildContractData>;
  onboardingChecklist: ReturnType<typeof buildChecklistConfig>;
  existingProfile: NonNullable<Awaited<ReturnType<IEmployeeProfileRepository['findByEmployeeNumber']>>>;
}): Promise<{ contractCreated?: boolean; checklistInstanceId?: string }> {
  const { deps, authorization, employeeNumber, contractData, onboardingChecklist, existingProfile } = params;

  const canCreateContract = existingProfile.userId === authorization.userId;

  let contractCreated = false;
  if (contractData && canCreateContract) {
    if (!deps.employmentContractRepository) {
      throw new Error('Employment contract repository is required when contract data is provided.');
    }
    const contractResult = await getEmploymentContractByEmployee(
      { employmentContractRepository: deps.employmentContractRepository },
      { authorization, employeeId: existingProfile.userId },
    );
    if (!contractResult.contract) {
      await createEmploymentContract(
        { employmentContractRepository: deps.employmentContractRepository },
        { authorization, contractData },
      );
      contractCreated = true;
    }
  }

  let checklistInstanceId: string | undefined;
  if (onboardingChecklist) {
    checklistInstanceId = await instantiateOnboardingChecklist({
      dependencies: createProfileDependencies(deps),
      authorization,
      onboardingChecklist,
      employeeIdentifier: employeeNumber,
    });
  }

  return {
    contractCreated: contractCreated || undefined,
    checklistInstanceId,
  };
}

export async function linkProfileIfNeeded(params: {
  repository: IEmployeeProfileRepository;
  orgId: string;
  profile: NonNullable<Awaited<ReturnType<IEmployeeProfileRepository['findByEmployeeNumber']>>>;
  userId: string;
}): Promise<NonNullable<Awaited<ReturnType<IEmployeeProfileRepository['findByEmployeeNumber']>>>> {
  if (params.profile.userId === params.userId) {
    return params.profile;
  }
  await params.repository.linkProfileToUser(params.orgId, params.profile.employeeNumber, params.userId);
  return { ...params.profile, userId: params.userId };
}

export async function ensureMembership(params: {
  authorization: RepositoryAuthorizationContext;
  membershipRepository: IMembershipRepository;
  billingService?: BillingServiceContract;
  invitation: { invitedByUserId?: string | null; targetEmail: string };
  payload: { displayName?: string; email?: string; roles?: string[] };
  profile: {
    jobTitle?: string | null;
    employmentType: EmployeeProfilePayload['employmentType'];
    startDate?: Date | string | null;
    metadata?: EmployeeProfilePayload['metadata'];
  };
  userId: string;
  employeeNumber: string;
}): Promise<{ alreadyMember: boolean }> {
  const existing = await params.membershipRepository.findMembership(params.authorization, params.userId);
  if (existing) {
    return { alreadyMember: true };
  }

  const userUpdate = buildUserActivationPayload(params.payload, params.invitation.targetEmail);
  const profilePayload: EmployeeProfilePayload = {
    orgId: params.authorization.orgId,
    userId: params.userId,
    employeeNumber: params.employeeNumber,
    jobTitle: params.profile.jobTitle,
    employmentType: params.profile.employmentType,
    startDate: parseDate(params.profile.startDate ?? undefined) ?? null,
    metadata: params.profile.metadata ?? null,
  };

  await params.membershipRepository.createMembershipWithProfile(params.authorization, {
    userId: params.userId,
    invitedByUserId: params.invitation.invitedByUserId ?? undefined,
    roles: resolveRoles(params.payload.roles),
    profile: profilePayload,
    userUpdate,
  });

  await params.billingService?.syncSeats({ authorization: params.authorization });
  return { alreadyMember: false };
}

export function buildUserActivationPayload(
  payload: { displayName?: string; email?: string },
  fallbackEmail: string,
): UserActivationPayload {
  const email = payload.email?.trim() ?? fallbackEmail;
  const displayName = payload.displayName?.trim() ?? email;
  return {
    displayName,
    email,
    status: MembershipStatus.ACTIVE,
  };
}

export function canLinkExistingProfile(
  profile: Awaited<ReturnType<IEmployeeProfileRepository['findByEmployeeNumber']>>,
  targetEmail: string,
): boolean {
  if (!profile) {
    return false;
  }

  const normalizedTarget = targetEmail.trim().toLowerCase();
  const matchesEmail = [profile.email, profile.personalEmail]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .some((value) => value.trim().toLowerCase() === normalizedTarget);

  if (matchesEmail) {
    return true;
  }

  const metadata = profile.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return false;
  }
  return (metadata as Record<string, unknown>).preboarding === true;
}
