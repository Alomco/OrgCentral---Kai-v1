import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import type {
    PerformanceRepository,
    UpdateReviewDTO,
} from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface UpdatePerformanceReviewDependencies {
    repository: PerformanceRepository;
}

export interface UpdatePerformanceReviewInput {
    authorization: RepositoryAuthorizationContext;
    id: string;
    updates: UpdateReviewDTO;
}

export interface UpdatePerformanceReviewResult {
    review: PerformanceReview;
}

export async function updatePerformanceReview(
    deps: UpdatePerformanceReviewDependencies,
    input: UpdatePerformanceReviewInput,
): Promise<UpdatePerformanceReviewResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.id, 'Performance review ID');

    const review = await deps.repository.updateReview(input.id, input.updates);
    return { review };
}
