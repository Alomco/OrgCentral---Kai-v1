import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { deletePerformanceReviewSchema } from '@/server/types/hr-performance-schemas';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_REVIEW,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface DeletePerformanceReviewByIdControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface DeletePerformanceReviewByIdControllerResult {
    success: true;
}

export async function deletePerformanceReviewByIdController(
    controllerInput: DeletePerformanceReviewByIdControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<DeletePerformanceReviewByIdControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawId = readOptionalStringField(controllerInput.input, 'id');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'delete',
        resourceType: PERFORMANCE_RESOURCE_REVIEW,
        resourceAttributes: { reviewId: rawId },
    });

    const payload = deletePerformanceReviewSchema.parse(controllerInput.input);

    await resolved.service.deleteReview({ authorization, id: payload.id });
    return { success: true };
}
