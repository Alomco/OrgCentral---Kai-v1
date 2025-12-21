import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { deletePerformanceGoalSchema } from '@/server/types/hr-performance-schemas';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_GOAL,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface DeletePerformanceGoalControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface DeletePerformanceGoalControllerResult {
    success: true;
}

export async function deletePerformanceGoalController(
    controllerInput: DeletePerformanceGoalControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<DeletePerformanceGoalControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawGoalId = readOptionalStringField(controllerInput.input, 'goalId');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'delete',
        resourceType: PERFORMANCE_RESOURCE_GOAL,
        resourceAttributes: { goalId: rawGoalId },
    });

    const payload = deletePerformanceGoalSchema.parse(controllerInput.input);

    await resolved.service.deleteGoal({ authorization, goalId: payload.goalId });
    return { success: true };
}
