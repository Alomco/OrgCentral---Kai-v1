import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmploymentContract } from '@/server/types/hr-types';
import { listEmploymentContractsByEmployee } from './list-employment-contracts-by-employee';

export interface ListEmploymentContractsByEmployeeForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface ListEmploymentContractsByEmployeeForUiResult {
    contracts: EmploymentContract[];
}

function resolveDependencies() {
    const { contractRepo } = buildPeopleServiceDependencies();
    return { employmentContractRepository: contractRepo };
}

export async function listEmploymentContractsByEmployeeForUi(
    input: ListEmploymentContractsByEmployeeForUiInput,
): Promise<ListEmploymentContractsByEmployeeForUiResult> {
    async function listContractsCached(
        cachedInput: ListEmploymentContractsByEmployeeForUiInput,
    ): Promise<ListEmploymentContractsByEmployeeForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listEmploymentContractsByEmployee(
            resolveDependencies(),
            cachedInput,
        );

        return { contracts: result.contracts };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await listEmploymentContractsByEmployee(
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
