import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { registerProfilesCache } from './shared/cache-helpers';

// Use-case: get an employee profile by id via people repositories under RBAC/ABAC tenant authorization.

export interface GetEmployeeProfileInput {
  authorization: RepositoryAuthorizationContext;
  profileId: string;
}

export interface GetEmployeeProfileResult {
  profile: EmployeeProfile | null;
}

export interface GetEmployeeProfileDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function getEmployeeProfile(
  dependencies: GetEmployeeProfileDependencies,
  input: GetEmployeeProfileInput,
): Promise<GetEmployeeProfileResult> {
  const profile = await dependencies.employeeProfileRepository.getEmployeeProfile(
    input.authorization.orgId,
    input.profileId
  );

  registerProfilesCache(input.authorization);

  return {
    profile: profile
      ? {
          ...profile,
          dataResidency: profile.dataResidency ?? input.authorization.dataResidency,
          dataClassification: profile.dataClassification ?? input.authorization.dataClassification,
        }
      : null,
  };
}
