import { EntityNotFoundError } from '@/server/errors';
import { toJsonValue } from '@/server/domain/absences/conversions';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertTrainingActorOrPrivileged, assertValidTrainingDates } from '@/server/security/authorization';
import type { TrainingRecord } from '@/server/types/hr-types';
import type { UpdateTrainingRecordPayload } from '@/server/types/hr-training-schemas';
import { normalizeString } from '@/server/use-cases/shared';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { invalidateTrainingCache } from './cache-helpers';

// Use-case: update a training record via training repositories with guard enforcement.

export interface UpdateTrainingRecordDependencies {
    trainingRepository: ITrainingRecordRepository;
}

export interface UpdateTrainingRecordInput {
    authorization: RepositoryAuthorizationContext;
    recordId: string;
    payload: UpdateTrainingRecordPayload;
}

export interface UpdateTrainingRecordResult {
    record: TrainingRecord;
}

export async function updateTrainingRecord(
    deps: UpdateTrainingRecordDependencies,
    input: UpdateTrainingRecordInput,
): Promise<UpdateTrainingRecordResult> {
    const current = await deps.trainingRepository.getTrainingRecord(
        input.authorization.orgId,
        input.recordId,
    );

    if (!current) {
        throw new EntityNotFoundError('TrainingRecord', { recordId: input.recordId });
    }

    assertTrainingActorOrPrivileged(input.authorization, current.userId);

    const startDate = input.payload.startDate ?? current.startDate;
    const endDate = input.payload.endDate ?? current.endDate ?? null;
    assertValidTrainingDates(startDate, endDate);

    const status = normalizeString(input.payload.status) ?? current.status;
    const courseName = normalizeString(input.payload.courseName) ?? current.courseName;
    const provider = normalizeString(input.payload.provider) ?? current.provider;
    const approved = input.payload.approved ?? current.approved;

    const approvedAt =
        input.payload.approvedAt !== undefined
            ? input.payload.approvedAt
            : approved
                ? current.approvedAt ?? new Date()
                : null;
    const approvedBy =
        input.payload.approvedBy !== undefined
            ? input.payload.approvedBy
            : approved
                ? current.approvedBy ?? input.authorization.userId
                : null;

    await deps.trainingRepository.updateTrainingRecord(input.authorization.orgId, input.recordId, {
        courseName,
        provider,
        startDate,
        endDate,
        expiryDate: input.payload.expiryDate ?? current.expiryDate ?? null,
        renewalDate: input.payload.renewalDate ?? current.renewalDate ?? null,
        status,
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

    const record = updated ?? current;

    await emitHrNotification(
        {},
        {
            authorization: input.authorization,
            notification: {
                userId: record.userId,
                title: 'Training updated',
                message: `${record.courseName} has been updated.`,
                type: 'training-assigned',
                priority: 'low',
                actionUrl: `/hr/training/${record.id}`,
                metadata: {
                    recordId: record.id,
                    courseName: record.courseName,
                    status: record.status,
                },
            },
        },
    );

    await invalidateTrainingCache(input.authorization);

    return { record };
}
