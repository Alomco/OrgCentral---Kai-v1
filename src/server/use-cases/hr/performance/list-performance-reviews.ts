import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import type { PerformanceRepository } from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface ListPerformanceReviewsDependencies {
    repository: PerformanceRepository;
}

export interface ListPerformanceReviewsInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface ListPerformanceReviewsResult {
    reviews: PerformanceReview[];
}

export async function listPerformanceReviews(
    deps: ListPerformanceReviewsDependencies,
    input: ListPerformanceReviewsInput,
): Promise<ListPerformanceReviewsResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.employeeId, 'Employee ID');

    const reviews = await deps.repository.getReviewsByEmployee(input.employeeId);
    return { reviews };
}
