import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { PerformanceReview } from '@/server/types/hr-types';
import { getPerformanceService } from '@/server/services/hr/performance/performance-service.provider';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetPerformanceReviewsForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
}

export interface GetPerformanceReviewsForUiResult {
    reviews: PerformanceReview[];
}

export async function getPerformanceReviewsForUi(
    input: GetPerformanceReviewsForUiInput,
): Promise<GetPerformanceReviewsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.PERFORMANCE_REVIEW,
        payload: {
            userId: input.userId ?? null,
        },
    });
    async function getReviewsCached(
        cachedInput: GetPerformanceReviewsForUiInput,
    ): Promise<GetPerformanceReviewsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getPerformanceService();
        const reviews = await service.getReviewsByEmployee({
            authorization: cachedInput.authorization,
            employeeId: cachedInput.userId ?? cachedInput.authorization.userId,
        });

        return { reviews };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getPerformanceService();
        const reviews = await service.getReviewsByEmployee({
            authorization: input.authorization,
            employeeId: input.userId ?? input.authorization.userId,
        });

        return { reviews };
    }

    return getReviewsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
