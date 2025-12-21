import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createPerformanceGoalSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_GOAL,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface AddPerformanceGoalControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface AddPerformanceGoalControllerResult {
    success: true;
    goal: PerformanceGoal;
}

export async function addPerformanceGoalController(
    controllerInput: AddPerformanceGoalControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<AddPerformanceGoalControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawReviewId = readOptionalStringField(controllerInput.input, 'reviewId');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'create',
        resourceType: PERFORMANCE_RESOURCE_GOAL,
        resourceAttributes: { reviewId: rawReviewId },
    });

    const payload = createPerformanceGoalSchema.parse(controllerInput.input);

    const { reviewId, ...goal } = payload;
    const created = await resolved.service.addGoal({ authorization, reviewId, goal });

    return { success: true, goal: created };
}
