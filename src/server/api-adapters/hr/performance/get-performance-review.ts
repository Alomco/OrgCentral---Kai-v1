import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPerformanceReviewSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_REVIEW,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface GetPerformanceReviewControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface GetPerformanceReviewControllerResult {
    success: true;
    review: PerformanceReview | null;
}

export async function getPerformanceReviewController(
    controllerInput: GetPerformanceReviewControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<GetPerformanceReviewControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawId = readOptionalStringField(controllerInput.input, 'id');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: PERFORMANCE_RESOURCE_REVIEW,
        resourceAttributes: { reviewId: rawId },
    });

    const payload = getPerformanceReviewSchema.parse(controllerInput.input);

    const review = await resolved.service.getReviewById({ authorization, id: payload.id });
    return { success: true, review };
}
// API adapter: Use-case: get a performance review by id through performance repositories under authorization.
