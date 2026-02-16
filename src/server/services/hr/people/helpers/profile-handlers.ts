import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import { getEmployeeProfile as getEmployeeProfileUseCase } from '@/server/use-cases/hr/people/get-employee-profile';
import { getEmployeeProfileByUser as getEmployeeProfileByUserUseCase } from '@/server/use-cases/hr/people/get-employee-profile-by-user';
import { listEmployeeProfiles as listEmployeeProfilesUseCase } from '@/server/use-cases/hr/people/list-employee-profiles';
import { countEmployeeProfiles as countEmployeeProfilesUseCase } from '@/server/use-cases/hr/people/count-employee-profiles';
import { createEmployeeProfile as createEmployeeProfileUseCase } from '@/server/use-cases/hr/people/create-employee-profile';
import { updateEmployeeProfile as updateEmployeeProfileUseCase } from '@/server/use-cases/hr/people/update-employee-profile';
import {
  deleteEmployeeProfile as deleteEmployeeProfileUseCase,
  type DeleteEmployeeProfileResult,
} from '@/server/use-cases/hr/people/delete-employee-profile';
import type { PeopleListFilters, ProfileMutationPayload } from '@/server/types/hr/people';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { ResultAsync } from 'neverthrow';

interface ProfileRepositoryDeps {
  profileRepo: IEmployeeProfileRepository;
}

const toError = (error: unknown): Error => (error instanceof Error ? error : new Error('Unknown error'));

export function getEmployeeProfile(params: {
  authorization: RepositoryAuthorizationContext;
  profileId: string;
  repositories: ProfileRepositoryDeps;
}): ResultAsync<{ profile: EmployeeProfile | null }, Error> {
  return ResultAsync.fromPromise(
    getEmployeeProfileUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        profileId: params.profileId,
      },
    ),
    toError,
  );
}

export function getEmployeeProfileByUser(params: {
  authorization: RepositoryAuthorizationContext;
  userId: string;
  repositories: ProfileRepositoryDeps;
}): ResultAsync<{ profile: EmployeeProfile | null }, Error> {
  return ResultAsync.fromPromise(
    getEmployeeProfileByUserUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        userId: params.userId,
      },
    ),
    toError,
  );
}

export function listEmployeeProfiles(params: {
  authorization: RepositoryAuthorizationContext;
  filters?: PeopleListFilters;
  limit?: number;
  repositories: ProfileRepositoryDeps;
}): ResultAsync<{ profiles: EmployeeProfile[] }, Error> {
  return ResultAsync.fromPromise(
    listEmployeeProfilesUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        filters: params.filters,
        limit: params.limit,
      },
    ),
    toError,
  );
}

export function countEmployeeProfiles(params: {
  authorization: RepositoryAuthorizationContext;
  filters?: PeopleListFilters;
  repositories: ProfileRepositoryDeps;
}): ResultAsync<{ count: number }, Error> {
  return ResultAsync.fromPromise(
    countEmployeeProfilesUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        filters: params.filters,
      },
    ),
    toError,
  );
}

export function createEmployeeProfile(params: {
  authorization: RepositoryAuthorizationContext;
  payload: ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
  repositories: ProfileRepositoryDeps;
}): ResultAsync<{ profileId: string; profile?: EmployeeProfile }, Error> {
  return ResultAsync.fromPromise(
    createEmployeeProfileUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        profileData: params.payload,
      },
    ),
    toError,
  ).andThen(() =>
    getEmployeeProfileByUser({
      authorization: params.authorization,
      userId: params.payload.userId,
      repositories: params.repositories,
    }).map((result) => {
      const profile = result.profile;
      if (!profile) {
        return { profileId: '' };
      }

      return { profileId: profile.id, profile };
    }),
  );
}

export function updateEmployeeProfile(params: {
  authorization: RepositoryAuthorizationContext;
  profileId: string;
  updates: ProfileMutationPayload['changes'];
  repositories: ProfileRepositoryDeps;
}): ResultAsync<{ profile: EmployeeProfile | null }, Error> {
  return ResultAsync.fromPromise(
    updateEmployeeProfileUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        profileId: params.profileId,
        profileUpdates: params.updates,
      },
    ),
    toError,
  ).andThen(() =>
    getEmployeeProfile({
      authorization: params.authorization,
      profileId: params.profileId,
      repositories: params.repositories,
    }),
  );
}

export function deleteEmployeeProfile(params: {
  authorization: RepositoryAuthorizationContext;
  profileId: string;
  repositories: ProfileRepositoryDeps;
}): ResultAsync<DeleteEmployeeProfileResult, Error> {
  return ResultAsync.fromPromise(
    deleteEmployeeProfileUseCase(
      { employeeProfileRepository: params.repositories.profileRepo },
      {
        authorization: params.authorization,
        profileId: params.profileId,
      },
    ),
    toError,
  );
}
