import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { ProfileMutationPayload } from '@/server/types/hr/people';
import { invalidateProfilesAfterMutation } from './shared/cache-helpers';

// Use-case: create an employee profile via people repositories with RBAC/ABAC authorization safeguards.

export interface CreateEmployeeProfileInput {
  authorization: RepositoryAuthorizationContext;
  profileData: ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
}

export interface CreateEmployeeProfileResult {
  success: true;
}

export interface CreateEmployeeProfileDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function createEmployeeProfile(
  dependencies: CreateEmployeeProfileDependencies,
  input: CreateEmployeeProfileInput,
): Promise<CreateEmployeeProfileResult> {
  const orgId = input.authorization.orgId;
  const payload = {
    ...input.profileData,
    orgId,
    healthStatus: input.profileData.healthStatus ?? 'UNDEFINED',
    employmentType: input.profileData.employmentType ?? 'FULL_TIME',
    employmentStatus: input.profileData.employmentStatus ?? 'ACTIVE',
    dataResidency: input.authorization.dataResidency,
    dataClassification: input.authorization.dataClassification,
  };

  await dependencies.employeeProfileRepository.createEmployeeProfile(
    orgId,
    payload
  );

  await invalidateProfilesAfterMutation(input.authorization);

  return {
    success: true,
  };
}
