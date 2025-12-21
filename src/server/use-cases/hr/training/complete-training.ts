import { EntityNotFoundError } from '@/server/errors';
import { toJsonValue } from '@/server/domain/absences/conversions';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertTrainingActorOrPrivileged, assertValidTrainingDates } from '@/server/security/authorization';
import type { TrainingRecord } from '@/server/types/hr-types';
import type { CompleteTrainingPayload } from '@/server/types/hr-training-schemas';
import { normalizeString } from '@/server/use-cases/shared';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { invalidateTrainingCache } from './cache-helpers';

export interface CompleteTrainingDependencies {
    trainingRepository: ITrainingRecordRepository;
}

export interface CompleteTrainingInput {
    authorization: RepositoryAuthorizationContext;
    recordId: string;
    payload: CompleteTrainingPayload;
}

export interface CompleteTrainingResult {
    record: TrainingRecord;
}

// Use-case: mark training as completed via training repositories under guard checks.
export async function completeTraining(
    deps: CompleteTrainingDependencies,
    input: CompleteTrainingInput,
): Promise<CompleteTrainingResult> {
    const current = await deps.trainingRepository.getTrainingRecord(
        input.authorization.orgId,
        input.recordId,
    );

    if (!current) {
        throw new EntityNotFoundError('TrainingRecord', { recordId: input.recordId });
    }

    assertTrainingActorOrPrivileged(input.authorization, current.userId);

    const completionDate = input.payload.completionDate ?? new Date();
    assertValidTrainingDates(current.startDate, completionDate);

    const approved = input.payload.approved ?? current.approved;
    const approvedAt = approved ? current.approvedAt ?? new Date() : null;
    const approvedBy = approved ? current.approvedBy ?? input.authorization.userId : null;

    const status = normalizeString(input.payload.status) ?? 'completed';

    await deps.trainingRepository.updateTrainingRecord(input.authorization.orgId, input.recordId, {
        status,
        endDate: completionDate,
        expiryDate: input.payload.expiryDate ?? current.expiryDate ?? null,
        renewalDate: input.payload.renewalDate ?? current.renewalDate ?? null,
        certificate:
            input.payload.certificate !== undefined
                ? normalizeString(input.payload.certificate ?? undefined)
                : current.certificate,
        competency:
            input.payload.competency !== undefined
                ? toJsonValue(input.payload.competency) ?? null
                : current.competency,
        cost:
            input.payload.cost !== undefined
                ? input.payload.cost ?? null
                : current.cost ?? null,
        approved,
        approvedAt,
        approvedBy,
        metadata:
            input.payload.metadata !== undefined
                ? toJsonValue(input.payload.metadata) ?? null
                : current.metadata,
    });

    const updated = await deps.trainingRepository.getTrainingRecord(
        input.authorization.orgId,
        input.recordId,
    );

    await emitHrNotification(
        {},
        {
            authorization: input.authorization,
            notification: {
                userId: current.userId,
                title: 'Training completed',
                message: `${current.courseName} has been marked as completed.`,
                type: 'training-completed',
                priority: 'medium',
                actionUrl: `/hr/training/${input.recordId}`,
                metadata: {
                    recordId: input.recordId,
                    courseName: current.courseName,
                    provider: current.provider,
                    status,
                    expiryDate: input.payload.expiryDate ?? current.expiryDate ?? null,
                },
            },
        },
    );

    await invalidateTrainingCache(input.authorization);

    return { record: updated ?? current };
}
