import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import type { PerformanceRepository } from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface ListPerformanceGoalsByReviewDependencies {
    repository: PerformanceRepository;
}

export interface ListPerformanceGoalsByReviewInput {
    authorization: RepositoryAuthorizationContext;
    reviewId: string;
}

export interface ListPerformanceGoalsByReviewResult {
    goals: PerformanceGoal[];
}

export async function listPerformanceGoalsByReview(
    deps: ListPerformanceGoalsByReviewDependencies,
    input: ListPerformanceGoalsByReviewInput,
): Promise<ListPerformanceGoalsByReviewResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.reviewId, 'Performance review ID');

    const goals = await deps.repository.getGoalsByReviewId(input.reviewId);
    return { goals };
}
