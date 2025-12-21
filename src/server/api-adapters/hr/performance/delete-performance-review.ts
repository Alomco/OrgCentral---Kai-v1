import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { ValidationError } from '@/server/errors';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_REVIEW,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface DeletePerformanceReviewControllerInput {
    request: Request;
    reviewId: string;
}

export interface DeletePerformanceReviewControllerResult {
    success: true;
}

export async function deletePerformanceReviewController(
    input: DeletePerformanceReviewControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<DeletePerformanceReviewControllerResult> {
    if (!input.reviewId) {
        throw new ValidationError('Performance review id is required.');
    }

    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: input.request.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: 'api:hr:performance:review:delete',
        action: 'delete',
        resourceType: PERFORMANCE_RESOURCE_REVIEW,
        resourceAttributes: { reviewId: input.reviewId },
    });

    await resolved.service.deleteReview({ authorization, id: input.reviewId });
    return { success: true };
}
