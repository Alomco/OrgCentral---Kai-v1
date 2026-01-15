import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { PeopleListFilters } from '@/server/types/hr/people';
import { countEmployeeProfiles } from './count-employee-profiles';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface CountEmployeeProfilesForUiInput {
    authorization: RepositoryAuthorizationContext;
    filters?: PeopleListFilters;
}

export interface CountEmployeeProfilesForUiResult {
    count: number;
}

function resolveEmployeeProfileRepository() {
    return createEmployeeProfileRepository();
}

export async function countEmployeeProfilesForUi(
    input: CountEmployeeProfilesForUiInput,
): Promise<CountEmployeeProfilesForUiResult> {
    async function countProfilesCached(
        cachedInput: CountEmployeeProfilesForUiInput,
    ): Promise<CountEmployeeProfilesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return countEmployeeProfiles(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            cachedInput,
        );
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return countEmployeeProfiles(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            input,
        );
    }

    return countProfilesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
