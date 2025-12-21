import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { UpdateTrainingRecordResult } from '@/server/use-cases/hr/training/update-training-record';
import { updateTrainingRecordSchema } from '@/server/types/hr-training-schemas';
import {
    defaultTrainingControllerDependencies,
    resolveTrainingControllerDependencies,
    TRAINING_RESOURCE,
    type TrainingControllerDependencies,
} from './common';

// API adapter: Use-case: update a training record via training repositories with guard enforcement.

export interface UpdateTrainingRecordControllerInput {
    headers: Headers | HeadersInit;
    recordId: string;
    input: unknown;
    auditSource: string;
}

export async function updateTrainingRecordController(
    controllerInput: UpdateTrainingRecordControllerInput,
    dependencies: TrainingControllerDependencies = defaultTrainingControllerDependencies,
): Promise<UpdateTrainingRecordResult> {
    const resolved = resolveTrainingControllerDependencies(dependencies);
    const recordId = z.uuid().parse(controllerInput.recordId);
    const payload = updateTrainingRecordSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'update',
        resourceType: TRAINING_RESOURCE,
        resourceAttributes: { recordId, status: payload.status ?? null },
    });

    return resolved.service.updateTrainingRecord({ authorization, recordId, payload });
}
