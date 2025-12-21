import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import type {
    CreateReviewDTO,
    PerformanceRepository,
} from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface RecordPerformanceReviewDependencies {
    repository: PerformanceRepository;
}

export interface RecordPerformanceReviewInput {
    authorization: RepositoryAuthorizationContext;
    review: CreateReviewDTO;
}

export interface RecordPerformanceReviewResult {
    review: PerformanceReview;
}

export async function recordPerformanceReview(
    deps: RecordPerformanceReviewDependencies,
    input: RecordPerformanceReviewInput,
): Promise<RecordPerformanceReviewResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.review.employeeId, 'Employee ID');
    assertNonEmpty(input.review.reviewerUserId, 'Reviewer user ID');

    const review = await deps.repository.createReview(input.review);
    return { review };
}
