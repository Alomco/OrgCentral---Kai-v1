import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { registerProfilesCache } from './shared/cache-helpers';
import { assertPeopleProfileReader } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

// Use-case: get an employee profile by user id through people repositories with RBAC/ABAC guard checks.

export interface GetEmployeeProfileByUserInput {
  authorization: RepositoryAuthorizationContext;
  userId: string; // The ID of the user whose profile we want to get
}

export interface GetEmployeeProfileByUserResult {
  profile: EmployeeProfile | null;
}

export interface GetEmployeeProfileByUserDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function getEmployeeProfileByUser(
  dependencies: GetEmployeeProfileByUserDependencies,
  input: GetEmployeeProfileByUserInput,
): Promise<GetEmployeeProfileByUserResult> {
  const profile = await dependencies.employeeProfileRepository.getEmployeeProfileByUser(
    input.authorization.orgId,
    input.userId
  );

  await assertPeopleProfileReader({
    authorization: input.authorization,
    action: HR_ACTION.READ,
    resourceAttributes: profile
      ? {
          profileId: profile.id,
          userId: profile.userId,
          departmentId: profile.departmentId ?? null,
          orgId: profile.orgId,
        }
      : { userId: input.userId, orgId: input.authorization.orgId },
  });

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
