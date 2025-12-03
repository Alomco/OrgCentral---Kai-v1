import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import { invalidateProfilesAfterMutation } from './shared/cache-helpers';

// Use-case: delete an employee profile using people repositories under RBAC/ABAC tenant guard.

export interface DeleteEmployeeProfileInput {
  authorization: RepositoryAuthorizationContext;
  profileId: string;
}

export interface DeleteEmployeeProfileResult {
  success: true;
}

export interface DeleteEmployeeProfileDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function deleteEmployeeProfile(
  dependencies: DeleteEmployeeProfileDependencies,
  input: DeleteEmployeeProfileInput,
): Promise<DeleteEmployeeProfileResult> {
  await dependencies.employeeProfileRepository.deleteEmployeeProfile(
    input.authorization.orgId,
    input.profileId
  );

  await invalidateProfilesAfterMutation(input.authorization);

  return {
    success: true,
  };
}
