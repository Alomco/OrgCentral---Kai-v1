import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmploymentContract } from '@/server/types/hr-types';
import type { ContractListFilters } from '@/server/types/hr/people';
import { listEmploymentContracts } from './list-employment-contracts';

export interface ListEmploymentContractsForUiInput {
    authorization: RepositoryAuthorizationContext;
    filters?: ContractListFilters;
}

export interface ListEmploymentContractsForUiResult {
    contracts: EmploymentContract[];
}

function resolveDependencies() {
    const { contractRepo } = buildPeopleServiceDependencies();
    return { employmentContractRepository: contractRepo };
}

export async function listEmploymentContractsForUi(
    input: ListEmploymentContractsForUiInput,
): Promise<ListEmploymentContractsForUiResult> {
    async function listContractsCached(
        cachedInput: ListEmploymentContractsForUiInput,
    ): Promise<ListEmploymentContractsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listEmploymentContracts(
            resolveDependencies(),
            cachedInput,
        );

        return { contracts: result.contracts };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await listEmploymentContracts(
            resolveDependencies(),
            input,
        );

        return { contracts: result.contracts };
    }

    return listContractsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
