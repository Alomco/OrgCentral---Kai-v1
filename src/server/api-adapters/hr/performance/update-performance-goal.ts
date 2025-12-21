import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updatePerformanceGoalSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_GOAL,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface UpdatePerformanceGoalControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface UpdatePerformanceGoalControllerResult {
    success: true;
    goal: PerformanceGoal;
}

export async function updatePerformanceGoalController(
    controllerInput: UpdatePerformanceGoalControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<UpdatePerformanceGoalControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawGoalId = readOptionalStringField(controllerInput.input, 'goalId');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'update',
        resourceType: PERFORMANCE_RESOURCE_GOAL,
        resourceAttributes: { goalId: rawGoalId },
    });

    const payload = updatePerformanceGoalSchema.parse(controllerInput.input);

    const { goalId, ...updates } = payload;
    const goal = await resolved.service.updateGoal({ authorization, goalId, updates });

    return { success: true, goal };
}
