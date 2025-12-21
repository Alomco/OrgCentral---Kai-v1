import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { GetTrainingRecordResult } from '@/server/use-cases/hr/training/get-training-record';
import {
    defaultTrainingControllerDependencies,
    resolveTrainingControllerDependencies,
    TRAINING_RESOURCE,
    type TrainingControllerDependencies,
} from './common';

// API adapter: Use-case: get a training record by id through training repositories under tenant authorization.

export interface GetTrainingRecordControllerInput {
    headers: Headers | HeadersInit;
    recordId: string;
    auditSource: string;
}

export async function getTrainingRecordController(
    controllerInput: GetTrainingRecordControllerInput,
    dependencies: TrainingControllerDependencies = defaultTrainingControllerDependencies,
): Promise<GetTrainingRecordResult> {
    const resolved = resolveTrainingControllerDependencies(dependencies);
    const recordId = z.uuid().parse(controllerInput.recordId);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: TRAINING_RESOURCE,
        resourceAttributes: { recordId },
    });

    return resolved.service.getTrainingRecord({ authorization, recordId });
}
