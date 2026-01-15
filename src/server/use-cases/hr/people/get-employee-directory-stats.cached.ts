import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

import {
  getEmployeeDirectoryStats,
  type EmployeeDirectoryStats,
} from './get-employee-directory-stats';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface GetEmployeeDirectoryStatsForUiInput {
  authorization: RepositoryAuthorizationContext;
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
  return createEmployeeProfileRepository();
}

export async function getEmployeeDirectoryStatsForUi(
  input: GetEmployeeDirectoryStatsForUiInput,
): Promise<EmployeeDirectoryStats> {
  async function getStatsCached(
    cachedInput: GetEmployeeDirectoryStatsForUiInput,
  ): Promise<EmployeeDirectoryStats> {
    'use cache';
    cacheLife(CACHE_LIFE_SHORT);

    return getEmployeeDirectoryStats(
      { employeeProfileRepository: resolveEmployeeProfileRepository() },
      cachedInput,
    );
  }

  if (input.authorization.dataClassification !== 'OFFICIAL') {
    noStore();
    return getEmployeeDirectoryStats(
      { employeeProfileRepository: resolveEmployeeProfileRepository() },
      input,
    );
  }

  return getStatsCached({
    ...input,
    authorization: toCacheSafeAuthorizationContext(input.authorization),
  });
}
