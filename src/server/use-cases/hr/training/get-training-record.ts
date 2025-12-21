import { AuthorizationError, EntityNotFoundError } from '@/server/errors';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { canManageOrgTraining } from '@/server/security/authorization';
import type { TrainingRecord } from '@/server/types/hr-types';
import { registerTrainingCache } from './cache-helpers';

// Use-case: get a training record by id through training repositories under tenant authorization.

export interface GetTrainingRecordDependencies {
    trainingRepository: ITrainingRecordRepository;
}

export interface GetTrainingRecordInput {
    authorization: RepositoryAuthorizationContext;
    recordId: string;
}

export interface GetTrainingRecordResult {
    record: TrainingRecord;
}

export async function getTrainingRecord(
    deps: GetTrainingRecordDependencies,
    input: GetTrainingRecordInput,
): Promise<GetTrainingRecordResult> {
    const record = await deps.trainingRepository.getTrainingRecord(
        input.authorization.orgId,
        input.recordId,
    );

    if (!record) {
        throw new EntityNotFoundError('TrainingRecord', { recordId: input.recordId });
    }

    if (!canManageOrgTraining(input.authorization) && record.userId !== input.authorization.userId) {
        throw new AuthorizationError('You cannot view this training record.');
    }

    registerTrainingCache(input.authorization);

    return { record };
}
