import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import type { PerformanceRepository } from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface GetPerformanceReviewDependencies {
    repository: PerformanceRepository;
}

export interface GetPerformanceReviewInput {
    authorization: RepositoryAuthorizationContext;
    id: string;
}

export interface GetPerformanceReviewResult {
    review: PerformanceReview | null;
}

export async function getPerformanceReview(
    deps: GetPerformanceReviewDependencies,
    input: GetPerformanceReviewInput,
): Promise<GetPerformanceReviewResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.id, 'Performance review ID');

    const review = await deps.repository.getReviewById(input.id);
    return { review };
}
