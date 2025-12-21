import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updatePerformanceReviewSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_REVIEW,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface UpdatePerformanceReviewControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface UpdatePerformanceReviewControllerResult {
    success: true;
    review: PerformanceReview;
}

export async function updatePerformanceReviewController(
    controllerInput: UpdatePerformanceReviewControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<UpdatePerformanceReviewControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawId = readOptionalStringField(controllerInput.input, 'id');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'update',
        resourceType: PERFORMANCE_RESOURCE_REVIEW,
        resourceAttributes: { reviewId: rawId },
    });

    const payload = updatePerformanceReviewSchema.parse(controllerInput.input);

    const { id, ...updates } = payload;
    const review = await resolved.service.updateReview({ authorization, id, updates });
    return { success: true, review };
}
// API adapter: Use-case: update a performance review via performance repositories with guard checks.
