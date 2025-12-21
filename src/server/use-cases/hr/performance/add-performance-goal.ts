import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import type {
    CreateGoalDTO,
    PerformanceRepository,
} from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';

export interface AddPerformanceGoalDependencies {
    repository: PerformanceRepository;
}

export interface AddPerformanceGoalInput {
    authorization: RepositoryAuthorizationContext;
    reviewId: string;
    goal: CreateGoalDTO;
}

export interface AddPerformanceGoalResult {
    goal: PerformanceGoal;
}

export async function addPerformanceGoal(
    deps: AddPerformanceGoalDependencies,
    input: AddPerformanceGoalInput,
): Promise<AddPerformanceGoalResult> {
    assertNonEmpty(input.authorization.orgId, 'Organization ID');
    assertNonEmpty(input.reviewId, 'Performance review ID');
    assertNonEmpty(input.goal.description, 'Goal description');

    const goal = await deps.repository.addGoal(input.reviewId, input.goal);
    return { goal };
}
