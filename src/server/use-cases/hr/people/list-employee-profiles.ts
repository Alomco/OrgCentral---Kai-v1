import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { EmployeeProfile } from '@/server/types/hr-types';
import type { PeopleListFilters } from '@/server/types/hr/people';
import { registerProfilesCache } from './shared/cache-helpers';
import { normalizeProfileFilters } from './shared/profile-validators';

// Use-case: list employee profiles for an organization via people repositories with RBAC/ABAC filters.

export interface ListEmployeeProfilesInput {
  authorization: RepositoryAuthorizationContext;
  filters?: PeopleListFilters;
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

  const profiles = await dependencies.employeeProfileRepository.getEmployeeProfilesByOrganization(
    input.authorization.orgId,
    normalizedFilters
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
