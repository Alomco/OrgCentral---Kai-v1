import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { listComplianceItems } from './list-compliance-items';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListComplianceItemsForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
}

export interface ListComplianceItemsForUiResult {
    items: ComplianceLogItem[];
}

function resolveDependencies() {
    const { complianceItemRepository } = buildComplianceRepositoryDependencies();
    return { complianceItemRepository };
}

export async function listComplianceItemsForUi(
    input: ListComplianceItemsForUiInput,
): Promise<ListComplianceItemsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
        resourceId: input.userId,
    });
    async function listItemsCached(
        cachedInput: ListComplianceItemsForUiInput,
    ): Promise<ListComplianceItemsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const items = await listComplianceItems(resolveDependencies(), cachedInput);

        return { items };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const items = await listComplianceItems(resolveDependencies(), input);

        return { items };
    }

    return listItemsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
