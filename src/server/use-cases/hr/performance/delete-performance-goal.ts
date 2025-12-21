import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { PerformanceRepository } from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface DeletePerformanceGoalDependencies {
    repository: PerformanceRepository;
}

export interface DeletePerformanceGoalInput {
    authorization: RepositoryAuthorizationContext;
    goalId: string;
}

export interface DeletePerformanceGoalResult {
    success: true;
}

export async function deletePerformanceGoal(
    dependencies: DeletePerformanceGoalDependencies,
    input: DeletePerformanceGoalInput,
): Promise<DeletePerformanceGoalResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.goalId, 'Performance goal ID');
    await dependencies.repository.deleteGoal(input.goalId);
    return { success: true };
}
