import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ComplianceItemsGroup } from './list-compliance-items-grouped';
import { listComplianceItemsGrouped } from './list-compliance-items-grouped';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListComplianceItemsGroupedForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
    uncategorizedLabel?: string;
}

export interface ListComplianceItemsGroupedForUiResult {
    groups: ComplianceItemsGroup[];
}

function resolveDependencies() {
    const { complianceItemRepository, complianceCategoryRepository } =
        buildComplianceRepositoryDependencies();
    return { complianceItemRepository, complianceCategoryRepository };
}

export async function listComplianceItemsGroupedForUi(
    input: ListComplianceItemsGroupedForUiInput,
): Promise<ListComplianceItemsGroupedForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
        resourceId: input.userId,
        payload: {
            uncategorizedLabel: input.uncategorizedLabel ?? null,
        },
    });
    async function listItemsCached(
        cachedInput: ListComplianceItemsGroupedForUiInput,
    ): Promise<ListComplianceItemsGroupedForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const groups = await listComplianceItemsGrouped(resolveDependencies(), cachedInput);
        return { groups };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const groups = await listComplianceItemsGrouped(resolveDependencies(), input);
        return { groups };
    }

    return listItemsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
