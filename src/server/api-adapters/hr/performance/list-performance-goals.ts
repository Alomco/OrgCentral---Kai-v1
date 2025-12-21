import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listPerformanceGoalsByReviewSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_GOAL,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface ListPerformanceGoalsByReviewControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface ListPerformanceGoalsByReviewControllerResult {
    success: true;
    goals: PerformanceGoal[];
}

export async function listPerformanceGoalsByReviewController(
    controllerInput: ListPerformanceGoalsByReviewControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<ListPerformanceGoalsByReviewControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawReviewId = readOptionalStringField(controllerInput.input, 'reviewId');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: PERFORMANCE_RESOURCE_GOAL,
        resourceAttributes: { reviewId: rawReviewId },
    });

    const payload = listPerformanceGoalsByReviewSchema.parse(controllerInput.input);

    const goals = await resolved.service.getGoalsByReviewId({ authorization, reviewId: payload.reviewId });
    return { success: true, goals };
}
