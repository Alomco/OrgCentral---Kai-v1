import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { PerformanceRepository } from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface DeletePerformanceReviewDependencies {
    repository: PerformanceRepository;
}

export interface DeletePerformanceReviewInput {
    authorization: RepositoryAuthorizationContext;
    id: string;
}

export interface DeletePerformanceReviewResult {
    success: true;
}

export async function deletePerformanceReview(
    dependencies: DeletePerformanceReviewDependencies,
    input: DeletePerformanceReviewInput,
): Promise<DeletePerformanceReviewResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.id, 'Performance review ID');
    await dependencies.repository.deleteReview(input.id);
    return { success: true };
}
