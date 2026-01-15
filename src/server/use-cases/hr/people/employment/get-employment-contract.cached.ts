import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmploymentContract } from '@/server/types/hr-types';
import { getEmploymentContract } from './get-employment-contract';
import { createEmploymentContractRepository } from '@/server/services/hr/people/people-repository.factory';

export interface GetEmploymentContractForUiInput {
    authorization: RepositoryAuthorizationContext;
    contractId: string;
}

export interface GetEmploymentContractForUiResult {
    contract: EmploymentContract | null;
}

function resolveEmploymentContractRepository() {
    return createEmploymentContractRepository();
}

export async function getEmploymentContractForUi(
    input: GetEmploymentContractForUiInput,
): Promise<GetEmploymentContractForUiResult> {
    async function getContractCached(
        cachedInput: GetEmploymentContractForUiInput,
    ): Promise<GetEmploymentContractForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await getEmploymentContract(
            { employmentContractRepository: resolveEmploymentContractRepository() },
            cachedInput,
        );

        return { contract: result.contract };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await getEmploymentContract(
            { employmentContractRepository: resolveEmploymentContractRepository() },
            input,
        );

        return { contract: result.contract };
    }

    return getContractCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
