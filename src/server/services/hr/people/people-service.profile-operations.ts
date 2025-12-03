import type { RepositoryAuthorizationContext, TenantScopedRecord } from '@/server/repositories/security';
import {
  createEmployeeProfile,
  deleteEmployeeProfile,
  getEmployeeProfile,
  getEmployeeProfileByUser,
  listEmployeeProfiles,
  updateEmployeeProfile,
} from '@/server/services/hr/people/helpers/profile-handlers';
import type { PeopleServiceOperationRunner } from './people-service-runner';
import {
  emitProfileSideEffects,
  invalidateProfileCaches,
  registerProfileReadCaches,
  unwrapOrThrow,
} from './people-service.operation-helpers';
import type {
  CreateEmployeeProfilePayload,
  CreateEmployeeProfileResult,
  DeleteEmployeeProfilePayload,
  DeleteEmployeeProfileResult,
  GetEmployeeProfileByUserPayload,
  GetEmployeeProfileByUserResult,
  GetEmployeeProfilePayload,
  GetEmployeeProfileResult,
  ListEmployeeProfilesPayload,
  ListEmployeeProfilesResult,
  PeopleServiceDependencies,
  PeopleServiceInput,
  PeopleServiceNotifications,
  UpdateEmployeeProfilePayload,
  UpdateEmployeeProfileResult,
} from './people-service.types';
import type { PeoplePlatformAdapters } from './people-service.adapters';
import type { EmployeeProfile } from '@/server/types/hr-types';

type EnsureEntityAccessFunction = <TRecord extends TenantScopedRecord>(
  authorization: RepositoryAuthorizationContext,
  record: TRecord | null | undefined,
) => TRecord;

type EnsureEntitiesAccessFunction = <TRecord extends TenantScopedRecord>(
  authorization: RepositoryAuthorizationContext,
  records: TRecord[],
) => TRecord[];

export interface PeopleProfileOperationsContext {
  dependencies: PeopleServiceDependencies;
  notifications: PeopleServiceNotifications;
  runner: PeopleServiceOperationRunner;
  ensureEntityAccess: EnsureEntityAccessFunction;
  ensureEntitiesAccess: EnsureEntitiesAccessFunction;
  adapters: PeoplePlatformAdapters;
}

export function createPeopleProfileOperations(context: PeopleProfileOperationsContext) {
  const {
    dependencies,
    notifications,
    runner,
    ensureEntityAccess,
    ensureEntitiesAccess,
    adapters,
  } = context;

  return {
    async getEmployeeProfile(
      input: PeopleServiceInput<GetEmployeeProfilePayload>,
    ): Promise<GetEmployeeProfileResult> {
      const { profileId } = input.payload;

      return runner.runProfileReadOperation(
        'hr.people.profiles.get',
        input.authorization,
        { profileId },
        input.correlationId,
        async (authorization: RepositoryAuthorizationContext): Promise<GetEmployeeProfileResult> => {
          const { profile } = unwrapOrThrow<{ profile: EmployeeProfile | null }>(await getEmployeeProfile({
            authorization,
            profileId,
            repositories: { profileRepo: dependencies.profileRepo },
          }));

          return { profile: profile ? ensureEntityAccess(authorization, profile) : null };
        },
      );
    },

    async getEmployeeProfileByUser(
      input: PeopleServiceInput<GetEmployeeProfileByUserPayload>,
    ): Promise<GetEmployeeProfileByUserResult> {
      const { userId } = input.payload;

      return runner.runProfileReadOperation(
        'hr.people.profiles.getByUser',
        input.authorization,
        { targetUserId: userId },
        input.correlationId,
        async (authorization: RepositoryAuthorizationContext): Promise<GetEmployeeProfileByUserResult> => {
          const { profile } = unwrapOrThrow<{ profile: EmployeeProfile | null }>(await getEmployeeProfileByUser({
            authorization,
            userId,
            repositories: { profileRepo: dependencies.profileRepo },
          }));

          if (!profile) {
            return { profile: null };
          }

          registerProfileReadCaches(authorization, profile);
          return { profile: ensureEntityAccess(authorization, profile) };
        },
      );
    },

    async listEmployeeProfiles(
      input: PeopleServiceInput<ListEmployeeProfilesPayload>,
    ): Promise<ListEmployeeProfilesResult> {
      const filters = input.payload.filters;

      return runner.runProfileReadOperation(
        'hr.people.profiles.list',
        input.authorization,
        { filterCount: Object.keys(filters ?? {}).length, filters },
        input.correlationId,
        async (authorization: RepositoryAuthorizationContext): Promise<ListEmployeeProfilesResult> => {
          const { profiles } = unwrapOrThrow<{ profiles: EmployeeProfile[] }>(await listEmployeeProfiles({
            authorization,
            filters,
            repositories: { profileRepo: dependencies.profileRepo },
          }));

          profiles.forEach((profile) => registerProfileReadCaches(authorization, profile));
          return { profiles: ensureEntitiesAccess(authorization, profiles) };
        },
      );
    },

    async createEmployeeProfile(
      input: PeopleServiceInput<CreateEmployeeProfilePayload>,
    ): Promise<CreateEmployeeProfileResult> {
      const { profileData } = input.payload;

      return runner.runProfileWriteOperation(
        'hr.people.profiles.create',
        input.authorization,
        { targetUserId: profileData.userId, jobTitle: profileData.jobTitle },
        input.correlationId,
        async (authorization: RepositoryAuthorizationContext): Promise<CreateEmployeeProfileResult> => {
          const { profileId, profile } = unwrapOrThrow<{ profileId: string; profile?: EmployeeProfile }>(await createEmployeeProfile({
            authorization,
            payload: profileData,
            repositories: { profileRepo: dependencies.profileRepo },
          }));

          await invalidateProfileCaches(authorization, profile ?? undefined);
          if (profile) {
            const scopedProfile = ensureEntityAccess(authorization, profile);
            await emitProfileSideEffects({
              authorization,
              profile: scopedProfile,
              notifications,
              adapters,
              action: 'created',
              correlationId: input.correlationId,
            });
            return { profileId: scopedProfile.id };
          }

          return { profileId };
        },
      );
    },

    async updateEmployeeProfile(
      input: PeopleServiceInput<UpdateEmployeeProfilePayload>,
    ): Promise<UpdateEmployeeProfileResult> {
      const { profileId, profileUpdates } = input.payload;

      return runner.runProfileWriteOperation(
        'hr.people.profiles.update',
        input.authorization,
        { profileId, updateKeys: Object.keys(profileUpdates) },
        input.correlationId,
        async (authorization: RepositoryAuthorizationContext): Promise<UpdateEmployeeProfileResult> => {
          const { profile } = unwrapOrThrow<{ profile: EmployeeProfile | null }>(await updateEmployeeProfile({
            authorization,
            profileId,
            updates: profileUpdates,
            repositories: { profileRepo: dependencies.profileRepo },
          }));

          if (!profile) {
            throw new Error('Employee profile not found after update.');
          }

          const scopedProfile = ensureEntityAccess(authorization, profile);
          const updatedFields = Object.keys(profileUpdates);

          await invalidateProfileCaches(authorization, scopedProfile);
          await notifications.profileUpdated(authorization.orgId, scopedProfile.id, scopedProfile, updatedFields);
          await emitProfileSideEffects({
            authorization,
            profile: scopedProfile,
            notifications,
            adapters,
            action: 'updated',
            updatedFields,
            correlationId: input.correlationId,
          });

          return { profileId: scopedProfile.id };
        },
      );
    },

    async deleteEmployeeProfile(
      input: PeopleServiceInput<DeleteEmployeeProfilePayload>,
    ): Promise<DeleteEmployeeProfileResult> {
      const { profileId } = input.payload;

      return runner.runProfileWriteOperation(
        'hr.people.profiles.delete',
        input.authorization,
        { profileId },
        input.correlationId,
        async (authorization: RepositoryAuthorizationContext): Promise<DeleteEmployeeProfileResult> => {
          const { profile } = unwrapOrThrow<{ profile: EmployeeProfile | null }>(await getEmployeeProfile({
            authorization,
            profileId,
            repositories: { profileRepo: dependencies.profileRepo },
          }));

          if (!profile) {
            throw new Error('Employee profile not found.');
          }

          const scopedProfile = ensureEntityAccess(authorization, profile);

          await deleteEmployeeProfile({
            authorization,
            profileId,
            repositories: { profileRepo: dependencies.profileRepo },
          });
          await invalidateProfileCaches(authorization, scopedProfile);
          await emitProfileSideEffects({
            authorization,
            profile: scopedProfile,
            notifications,
            adapters,
            action: 'deleted',
            correlationId: input.correlationId,
          });

          return { success: true };
        },
      );
    },
  };
}
