import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { listComplianceItemsForOrg } from './list-compliance-items-for-org';

export interface ListComplianceItemsForOrgForUiInput {
    authorization: RepositoryAuthorizationContext;
    take?: number;
}

export interface ListComplianceItemsForOrgForUiResult {
    items: ComplianceLogItem[];
}

function resolveDependencies() {
    const { complianceItemRepository } = buildComplianceRepositoryDependencies();
    return { complianceItemRepository };
}

export async function listComplianceItemsForOrgForUi(
    input: ListComplianceItemsForOrgForUiInput,
): Promise<ListComplianceItemsForOrgForUiResult> {
    async function listItemsCached(
        cachedInput: ListComplianceItemsForOrgForUiInput,
    ): Promise<ListComplianceItemsForOrgForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listComplianceItemsForOrg(resolveDependencies(), cachedInput);
        return { items: result.items };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        const result = await listComplianceItemsForOrg(resolveDependencies(), input);
        return { items: result.items };
    }

    return listItemsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
