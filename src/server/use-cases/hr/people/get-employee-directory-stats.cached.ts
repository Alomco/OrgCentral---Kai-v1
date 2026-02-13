import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';

import {
  getEmployeeDirectoryStats,
  type EmployeeDirectoryStats,
} from './get-employee-directory-stats';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetEmployeeDirectoryStatsForUiInput {
  authorization: RepositoryAuthorizationContext;
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
  return createEmployeeProfileRepository();
}

export async function getEmployeeDirectoryStatsForUi(
  input: GetEmployeeDirectoryStatsForUiInput,
): Promise<EmployeeDirectoryStats> {
  await recordHrCachedReadAudit({
    authorization: input.authorization,
    action: HR_ACTION.READ,
    resource: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
  });
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
