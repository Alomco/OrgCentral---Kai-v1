import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { EmployeeProfile } from '@/server/types/hr-types';
import type { PeopleListFilters } from '@/server/types/hr/people';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { listEmployeeProfiles } from './list-employee-profiles';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface ListEmployeeProfilesForUiInput {
    authorization: RepositoryAuthorizationContext;
    filters?: PeopleListFilters;
}

export interface ListEmployeeProfilesForUiResult {
    profiles: EmployeeProfile[];
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
    return createEmployeeProfileRepository();
}

export async function listEmployeeProfilesForUi(
    input: ListEmployeeProfilesForUiInput,
): Promise<ListEmployeeProfilesForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
    });
    async function listProfilesCached(
        cachedInput: ListEmployeeProfilesForUiInput,
    ): Promise<ListEmployeeProfilesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return listEmployeeProfiles(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: cachedInput.authorization, filters: cachedInput.filters },
        );
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return listEmployeeProfiles(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: input.authorization, filters: input.filters },
        );
    }

    return listProfilesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
