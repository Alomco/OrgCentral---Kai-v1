import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import { invalidateProfilesAfterMutation } from './shared/cache-helpers';
import { assertPeopleProfileEditor } from '@/server/security/guards-hr-people';
import { EntityNotFoundError } from '@/server/errors';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

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
  const existing = await dependencies.employeeProfileRepository.getEmployeeProfile(
    input.authorization.orgId,
    input.profileId,
  );
  if (!existing) {
    throw new EntityNotFoundError('Employee profile');
  }

  await assertPeopleProfileEditor({
    authorization: input.authorization,
    action: HR_ACTION.DELETE,
    resourceAttributes: {
      profileId: existing.id,
      userId: existing.userId,
      departmentId: existing.departmentId ?? null,
      orgId: existing.orgId,
    },
  });

  await dependencies.employeeProfileRepository.deleteEmployeeProfile(
    input.authorization.orgId,
    input.profileId
  );

  await invalidateProfilesAfterMutation(input.authorization);

  return {
    success: true,
  };
}
