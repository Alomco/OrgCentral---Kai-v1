import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { EmploymentContract } from '@/server/types/hr-types';
import { listEmploymentContractsByEmployee } from './list-employment-contracts-by-employee';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

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
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.EMPLOYMENT_CONTRACT,
        resourceId: input.employeeId,
    });
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
