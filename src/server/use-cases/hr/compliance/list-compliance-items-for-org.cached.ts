import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { listComplianceItemsForOrg } from './list-compliance-items-for-org';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

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
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
        payload: {
            take: input.take ?? null,
        },
    });
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
