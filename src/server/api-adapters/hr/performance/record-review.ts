import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createPerformanceReviewSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_REVIEW,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface RecordPerformanceReviewControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface RecordPerformanceReviewControllerResult {
    success: true;
    review: PerformanceReview;
}

export async function recordPerformanceReviewController(
    controllerInput: RecordPerformanceReviewControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<RecordPerformanceReviewControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawEmployeeId = readOptionalStringField(controllerInput.input, 'employeeId');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'create',
        resourceType: PERFORMANCE_RESOURCE_REVIEW,
        resourceAttributes: { employeeId: rawEmployeeId },
    });

    const payload = createPerformanceReviewSchema.parse(controllerInput.input);

    const review = await resolved.service.createReview({ authorization, review: payload });
    return { success: true, review };
}
// API adapter: Use-case: record a performance review through performance repositories under tenant scope.
