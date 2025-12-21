import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { CompleteTrainingResult } from '@/server/use-cases/hr/training/complete-training';
import { completeTrainingSchema } from '@/server/types/hr-training-schemas';
import {
    defaultTrainingControllerDependencies,
    resolveTrainingControllerDependencies,
    TRAINING_RESOURCE,
    type TrainingControllerDependencies,
} from './common';

// API adapter: Use-case: mark training as completed via training repositories under guard checks.

export interface CompleteTrainingControllerInput {
    headers: Headers | HeadersInit;
    recordId: string;
    input: unknown;
    auditSource: string;
}

export async function completeTrainingController(
    controllerInput: CompleteTrainingControllerInput,
    dependencies: TrainingControllerDependencies = defaultTrainingControllerDependencies,
): Promise<CompleteTrainingResult> {
    const resolved = resolveTrainingControllerDependencies(dependencies);
    const recordId = z.uuid().parse(controllerInput.recordId);
    const payload = completeTrainingSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'update',
        resourceType: TRAINING_RESOURCE,
        resourceAttributes: { recordId, status: payload.status ?? 'completed' },
    });

    return resolved.service.completeTraining({ authorization, recordId, payload });
}
