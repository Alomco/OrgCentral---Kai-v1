import { EntityNotFoundError } from '@/server/errors';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertTrainingActorOrPrivileged } from '@/server/security/authorization';
import { invalidateTrainingCache } from './cache-helpers';

// Use-case: delete a training record using training repositories under guard policies.

export interface DeleteTrainingRecordDependencies {
    trainingRepository: ITrainingRecordRepository;
}

export interface DeleteTrainingRecordInput {
    authorization: RepositoryAuthorizationContext;
    recordId: string;
}

export interface DeleteTrainingRecordResult {
    recordDeleted: true;
}

export async function deleteTrainingRecord(
    deps: DeleteTrainingRecordDependencies,
    input: DeleteTrainingRecordInput,
): Promise<DeleteTrainingRecordResult> {
    const record = await deps.trainingRepository.getTrainingRecord(
        input.authorization.orgId,
        input.recordId,
    );

    if (!record) {
        throw new EntityNotFoundError('TrainingRecord', { recordId: input.recordId });
    }

    assertTrainingActorOrPrivileged(input.authorization, record.userId);

    await deps.trainingRepository.deleteTrainingRecord(input.authorization.orgId, input.recordId);
    await invalidateTrainingCache(input.authorization);
    return { recordDeleted: true };
}
