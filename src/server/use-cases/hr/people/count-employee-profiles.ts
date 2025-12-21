import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { PeopleListFilters } from '@/server/types/hr/people';
import { registerProfilesCache } from './shared/cache-helpers';
import { normalizeProfileFilters } from './shared/profile-validators';
import { assertPeopleProfileReader } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

export interface CountEmployeeProfilesInput {
  authorization: RepositoryAuthorizationContext;
  filters?: PeopleListFilters;
}

export interface CountEmployeeProfilesResult {
  count: number;
}

export interface CountEmployeeProfilesDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
}

export async function countEmployeeProfiles(
  dependencies: CountEmployeeProfilesDependencies,
  input: CountEmployeeProfilesInput,
): Promise<CountEmployeeProfilesResult> {
  const normalizedFilters = normalizeProfileFilters(input.filters);

  await assertPeopleProfileReader({
    authorization: input.authorization,
    action: HR_ACTION.READ,
    resourceAttributes: {
      orgId: input.authorization.orgId,
      filterCount: Object.keys(normalizedFilters ?? {}).length,
      filters: normalizedFilters,
    },
  });

  const count = await dependencies.employeeProfileRepository.countEmployeeProfilesByOrganization(
    input.authorization.orgId,
    normalizedFilters,
  );

  registerProfilesCache(input.authorization);

  return { count };
}
