import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { listPendingReviewComplianceItems } from './list-pending-review-items';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

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
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.COMPLIANCE_REVIEW,
        payload: {
            take: input.take ?? null,
        },
    });
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
