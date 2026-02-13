import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildPerformanceServiceDependencies } from '@/server/repositories/providers/hr/performance-service-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import { listPerformanceGoalsByReview } from './list-performance-goals-by-review';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListPerformanceGoalsByReviewForUiInput {
    authorization: RepositoryAuthorizationContext;
    reviewId: string;
}

export interface ListPerformanceGoalsByReviewForUiResult {
    goals: PerformanceGoal[];
}

function resolvePerformanceRepository(authorization: RepositoryAuthorizationContext) {
    const { repositoryFactory } = buildPerformanceServiceDependencies();
    return repositoryFactory(authorization);
}

export async function listPerformanceGoalsByReviewForUi(
    input: ListPerformanceGoalsByReviewForUiInput,
): Promise<ListPerformanceGoalsByReviewForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.PERFORMANCE_GOAL,
        resourceId: input.reviewId,
    });
    async function listGoalsCached(
        cachedInput: ListPerformanceGoalsByReviewForUiInput,
    ): Promise<ListPerformanceGoalsByReviewForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const repository = resolvePerformanceRepository(cachedInput.authorization);
        const result = await listPerformanceGoalsByReview({ repository }, cachedInput);
        return { goals: result.goals };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const repository = resolvePerformanceRepository(input.authorization);
        const result = await listPerformanceGoalsByReview({ repository }, input);
        return { goals: result.goals };
    }

    return listGoalsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
