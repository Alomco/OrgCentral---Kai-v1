import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { ListTrainingRecordsResult } from '@/server/use-cases/hr/training/list-training-records';
import { trainingRecordFiltersSchema } from '@/server/types/hr-training-schemas';
import {
    defaultTrainingControllerDependencies,
    resolveTrainingControllerDependencies,
    TRAINING_RESOURCE,
    type TrainingControllerDependencies,
} from './common';

// API adapter: Use-case: list training records for an organization or employee via training repositories with filters.

export interface ListTrainingRecordsControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export async function listTrainingRecordsController(
    controllerInput: ListTrainingRecordsControllerInput,
    dependencies: TrainingControllerDependencies = defaultTrainingControllerDependencies,
): Promise<ListTrainingRecordsResult> {
    const resolved = resolveTrainingControllerDependencies(dependencies);
    const filters = trainingRecordFiltersSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: TRAINING_RESOURCE,
        resourceAttributes: filters,
    });

    return resolved.service.listTrainingRecords({ authorization, filters });
}
