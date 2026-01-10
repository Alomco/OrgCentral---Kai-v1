import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaPerformanceRepository } from '@/server/repositories/prisma/hr/performance/prisma-performance-repository';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import { listPerformanceGoalsByReview } from './list-performance-goals-by-review';

export interface ListPerformanceGoalsByReviewForUiInput {
    authorization: RepositoryAuthorizationContext;
    reviewId: string;
}

export interface ListPerformanceGoalsByReviewForUiResult {
    goals: PerformanceGoal[];
}

function resolvePerformanceRepository(authorization: RepositoryAuthorizationContext): PrismaPerformanceRepository {
    return new PrismaPerformanceRepository(
        authorization.orgId,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}

export async function listPerformanceGoalsByReviewForUi(
    input: ListPerformanceGoalsByReviewForUiInput,
): Promise<ListPerformanceGoalsByReviewForUiResult> {
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
