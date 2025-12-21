import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { ProfileMutationPayload } from '@/server/types/hr/people';
import { invalidateProfilesAfterMutation } from './shared/cache-helpers';
import { EntityNotFoundError } from '@/server/errors';
import { assertPeopleProfileEditor } from '@/server/security/guards-hr-people';

// Use-case: update an employee profile using people repositories under RBAC/ABAC guard enforcement.

export interface UpdateEmployeeProfileInput {
  authorization: RepositoryAuthorizationContext;
  profileId: string;
  profileUpdates: ProfileMutationPayload['changes'];
}

export interface UpdateEmployeeProfileResult {
  success: true;
}

export interface UpdateEmployeeProfileDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function updateEmployeeProfile(
  dependencies: UpdateEmployeeProfileDependencies,
  input: UpdateEmployeeProfileInput,
): Promise<UpdateEmployeeProfileResult> {
  const existing = await dependencies.employeeProfileRepository.getEmployeeProfile(
    input.authorization.orgId,
    input.profileId,
  );
  if (!existing) {
    throw new EntityNotFoundError('Employee profile');
  }

  await assertPeopleProfileEditor({
    authorization: input.authorization,
    resourceAttributes: {
      profileId: input.profileId,
      userId: existing.userId,
      departmentId: existing.departmentId ?? null,
      orgId: existing.orgId,
    },
  });

  await dependencies.employeeProfileRepository.updateEmployeeProfile(
    input.authorization.orgId,
    input.profileId,
    input.profileUpdates
  );

  await invalidateProfilesAfterMutation(input.authorization);

  return {
    success: true,
  };
}
