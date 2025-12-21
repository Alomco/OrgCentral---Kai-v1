import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import type {
    PerformanceRepository,
    UpdateGoalDTO,
} from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface UpdatePerformanceGoalDependencies {
    repository: PerformanceRepository;
}

export interface UpdatePerformanceGoalInput {
    authorization: RepositoryAuthorizationContext;
    goalId: string;
    updates: UpdateGoalDTO;
}

export interface UpdatePerformanceGoalResult {
    goal: PerformanceGoal;
}

export async function updatePerformanceGoal(
    deps: UpdatePerformanceGoalDependencies,
    input: UpdatePerformanceGoalInput,
): Promise<UpdatePerformanceGoalResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.goalId, 'Performance goal ID');

    const goal = await deps.repository.updateGoal(input.goalId, input.updates);
    return { goal };
}
