import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { DeleteTrainingRecordResult } from '@/server/use-cases/hr/training/delete-training-record';
import {
    defaultTrainingControllerDependencies,
    resolveTrainingControllerDependencies,
    TRAINING_RESOURCE,
    type TrainingControllerDependencies,
} from './common';

// API adapter: Use-case: delete a training record using training repositories under guard policies.

export interface DeleteTrainingRecordControllerInput {
    headers: Headers | HeadersInit;
    recordId: string;
    auditSource: string;
}

export async function deleteTrainingRecordController(
    controllerInput: DeleteTrainingRecordControllerInput,
    dependencies: TrainingControllerDependencies = defaultTrainingControllerDependencies,
): Promise<DeleteTrainingRecordResult> {
    const resolved = resolveTrainingControllerDependencies(dependencies);
    const recordId = z.uuid().parse(controllerInput.recordId);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'delete',
        resourceType: TRAINING_RESOURCE,
        resourceAttributes: { recordId },
    });

    return resolved.service.deleteTrainingRecord({ authorization, recordId });
}
