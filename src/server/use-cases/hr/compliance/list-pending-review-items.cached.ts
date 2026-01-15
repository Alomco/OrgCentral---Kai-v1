import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { listPendingReviewComplianceItems } from './list-pending-review-items';

export interface ListPendingReviewComplianceItemsForUiInput {
    authorization: RepositoryAuthorizationContext;
    take?: number;
}

export interface ListPendingReviewComplianceItemsForUiResult {
    items: ComplianceLogItem[];
}

function resolveDependencies() {
    const { complianceItemRepository } = buildComplianceRepositoryDependencies();
    return { complianceItemRepository };
}

export async function listPendingReviewComplianceItemsForUi(
    input: ListPendingReviewComplianceItemsForUiInput,
): Promise<ListPendingReviewComplianceItemsForUiResult> {
    async function listItemsCached(
        cachedInput: ListPendingReviewComplianceItemsForUiInput,
    ): Promise<ListPendingReviewComplianceItemsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const items = await listPendingReviewComplianceItems(
            resolveDependencies(),
            cachedInput,
        );

        return { items };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const items = await listPendingReviewComplianceItems(
            resolveDependencies(),
            input,
        );

        return { items };
    }

    return listItemsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
