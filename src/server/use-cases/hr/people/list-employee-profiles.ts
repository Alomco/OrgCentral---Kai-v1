import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { EmployeeProfile } from '@/server/types/hr-types';
import type { PeopleListFilters } from '@/server/types/hr/people';
import { registerProfilesCache } from './shared/cache-helpers';
import { normalizeProfileFilters } from './shared/profile-validators';
import { assertPeopleProfileReader } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

// Use-case: list employee profiles for an organization via people repositories with RBAC/ABAC filters.

export interface ListEmployeeProfilesInput {
  authorization: RepositoryAuthorizationContext;
  filters?: PeopleListFilters;
  limit?: number;
}

export interface ListEmployeeProfilesResult {
  profiles: EmployeeProfile[];
}

export interface ListEmployeeProfilesDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function listEmployeeProfiles(
  dependencies: ListEmployeeProfilesDependencies,
  input: ListEmployeeProfilesInput,
): Promise<ListEmployeeProfilesResult> {
  const normalizedFilters = normalizeProfileFilters(input.filters);
  const normalizedLimit = normalizeListLimit(input.limit);

  await assertPeopleProfileReader({
    authorization: input.authorization,
    action: HR_ACTION.READ,
    resourceAttributes: {
      orgId: input.authorization.orgId,
      limit: normalizedLimit,
      filterCount: Object.keys(normalizedFilters ?? {}).length,
      filters: normalizedFilters,
    },
  });

  const profiles = await dependencies.employeeProfileRepository.getEmployeeProfilesByOrganization(
    input.authorization.orgId,
    normalizedFilters,
    normalizedLimit ? { limit: normalizedLimit } : undefined,
  );

  registerProfilesCache(input.authorization);

  return {
    profiles: profiles.map((profile) => ({
      ...profile,
      dataResidency: profile.dataResidency ?? input.authorization.dataResidency,
      dataClassification: profile.dataClassification ?? input.authorization.dataClassification,
    })),
  };
}

function normalizeListLimit(limit: number | undefined): number | undefined {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) {
    return undefined;
  }
  const normalized = Math.floor(limit);
  if (normalized < 1) {
    return undefined;
  }
  return Math.min(normalized, 200);
}
