import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { PeopleListFilters } from '@/server/types/hr/people';
import type {
  EmployeeProfileSortInput,
} from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';

import { listEmployeeDirectory } from './list-employee-directory';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface ListEmployeeDirectoryForUiInput {
  authorization: RepositoryAuthorizationContext;
  page: number;
  pageSize: number;
  sort?: EmployeeProfileSortInput;
  filters?: PeopleListFilters;
}

export interface ListEmployeeDirectoryForUiResult {
  profiles: Awaited<ReturnType<typeof listEmployeeDirectory>>['profiles'];
  totalCount: number;
  page: number;
  pageSize: number;
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
  return createEmployeeProfileRepository();
}

export async function listEmployeeDirectoryForUi(
  input: ListEmployeeDirectoryForUiInput,
): Promise<ListEmployeeDirectoryForUiResult> {
  async function listDirectoryCached(
    cachedInput: ListEmployeeDirectoryForUiInput,
  ): Promise<ListEmployeeDirectoryForUiResult> {
    'use cache';
    cacheLife(CACHE_LIFE_SHORT);

    return listEmployeeDirectory(
      { employeeProfileRepository: resolveEmployeeProfileRepository() },
      cachedInput,
    );
  }

  if (input.authorization.dataClassification !== 'OFFICIAL') {
    noStore();
    return listEmployeeDirectory(
      { employeeProfileRepository: resolveEmployeeProfileRepository() },
      input,
    );
  }

  return listDirectoryCached({
    ...input,
    authorization: toCacheSafeAuthorizationContext(input.authorization),
  });
}
