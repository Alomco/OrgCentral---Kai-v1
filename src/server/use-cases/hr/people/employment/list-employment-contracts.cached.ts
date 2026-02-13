import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { EmploymentContract } from '@/server/types/hr-types';
import type { ContractListFilters } from '@/server/types/hr/people';
import { listEmploymentContracts } from './list-employment-contracts';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

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
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.EMPLOYMENT_CONTRACT,
    });
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
