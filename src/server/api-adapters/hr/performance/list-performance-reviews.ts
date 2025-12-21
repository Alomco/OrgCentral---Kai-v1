import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listPerformanceReviewsByEmployeeSchema } from '@/server/types/hr-performance-schemas';
import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import {
    defaultPerformanceControllerDependencies,
    PERFORMANCE_RESOURCE_REVIEW,
    readOptionalStringField,
    resolvePerformanceControllerDependencies,
    type PerformanceControllerDependencies,
} from './common';

export interface ListPerformanceReviewsControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface ListPerformanceReviewsControllerResult {
    success: true;
    reviews: PerformanceReview[];
}

export async function listPerformanceReviewsByEmployeeController(
    controllerInput: ListPerformanceReviewsControllerInput,
    dependencies: PerformanceControllerDependencies = defaultPerformanceControllerDependencies,
): Promise<ListPerformanceReviewsControllerResult> {
    const resolved = resolvePerformanceControllerDependencies(dependencies);

    const rawEmployeeId = readOptionalStringField(controllerInput.input, 'employeeId');

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: PERFORMANCE_RESOURCE_REVIEW,
        resourceAttributes: { employeeId: rawEmployeeId },
    });

    const payload = listPerformanceReviewsByEmployeeSchema.parse(controllerInput.input);

    const reviews = await resolved.service.getReviewsByEmployee({ authorization, employeeId: payload.employeeId });
    return { success: true, reviews };
}
// API adapter: Use-case: list performance reviews for an organization or employee via performance repositories.
