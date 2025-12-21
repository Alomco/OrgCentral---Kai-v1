import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { enrollTrainingSchema } from '@/server/types/hr-training-schemas';
import {
    defaultTrainingControllerDependencies,
    resolveTrainingControllerDependencies,
    TRAINING_RESOURCE,
    type TrainingControllerDependencies,
} from './common';
import type { EnrollTrainingResult } from '@/server/use-cases/hr/training/enroll-training';

// API adapter: Use-case: enroll a user in training using training repositories and authorization guards.

export interface EnrollTrainingControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export async function enrollTrainingController(
    controllerInput: EnrollTrainingControllerInput,
    dependencies: TrainingControllerDependencies = defaultTrainingControllerDependencies,
): Promise<EnrollTrainingResult> {
    const resolved = resolveTrainingControllerDependencies(dependencies);
    const payload = enrollTrainingSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'create',
        resourceType: TRAINING_RESOURCE,
        resourceAttributes: {
            targetUserId: payload.userId,
            status: payload.status ?? 'in_progress',
            courseName: payload.courseName,
        },
    });

    return resolved.service.enrollTraining({ authorization, payload });
}
