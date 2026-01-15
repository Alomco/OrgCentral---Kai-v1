import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfile } from '@/server/types/hr-types';

import { getEmployeeProfile } from './get-employee-profile';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface GetEmployeeProfileForUiInput {
    authorization: RepositoryAuthorizationContext;
    profileId: string;
}

export interface GetEmployeeProfileForUiResult {
    profile: EmployeeProfile | null;
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
    return createEmployeeProfileRepository();
}

export async function getEmployeeProfileForUi(
    input: GetEmployeeProfileForUiInput,
): Promise<GetEmployeeProfileForUiResult> {
    async function getProfileCached(
        cachedInput: GetEmployeeProfileForUiInput,
    ): Promise<GetEmployeeProfileForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return getEmployeeProfile(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: cachedInput.authorization, profileId: cachedInput.profileId },
        );
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return getEmployeeProfile(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: input.authorization, profileId: input.profileId },
        );
    }

    return getProfileCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
