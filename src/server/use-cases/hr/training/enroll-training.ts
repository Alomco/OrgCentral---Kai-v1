import { ValidationError } from '@/server/errors';
import { toJsonValue } from '@/server/domain/absences/conversions';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    assertTrainingActorOrPrivileged,
    assertValidTrainingDates,
} from '@/server/security/authorization';
import type { EnrollTrainingPayload } from '@/server/types/hr-training-schemas';
import { normalizeString } from '@/server/use-cases/shared';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { invalidateTrainingCache } from './cache-helpers';

export interface EnrollTrainingDependencies {
    trainingRepository: ITrainingRecordRepository;
}

export interface EnrollTrainingInput {
    authorization: RepositoryAuthorizationContext;
    payload: EnrollTrainingPayload;
}

export interface EnrollTrainingResult {
    recordCreated: true;
}

// Use-case: enroll a user in training using training repositories and authorization guards.
export async function enrollTraining(
    deps: EnrollTrainingDependencies,
    input: EnrollTrainingInput,
): Promise<EnrollTrainingResult> {
    const { authorization, payload } = input;
    assertTrainingActorOrPrivileged(authorization, payload.userId);

    const startDate = payload.startDate;
    const endDate = payload.endDate ?? null;
    assertValidTrainingDates(startDate, endDate);

    const status = normalizeString(payload.status) ?? 'in_progress';

    if (payload.cost !== undefined && payload.cost !== null && payload.cost > 1_000_000) {
        throw new ValidationError('Training cost exceeds allowed maximum.');
    }

    await deps.trainingRepository.createTrainingRecord(authorization.orgId, {
        orgId: authorization.orgId,
        userId: payload.userId,
        courseName: normalizeString(payload.courseName) ?? payload.courseName,
        provider: normalizeString(payload.provider) ?? payload.provider,
        startDate,
        endDate,
        expiryDate: payload.expiryDate ?? null,
        renewalDate: payload.renewalDate ?? null,
        status,
        certificate: normalizeString(payload.certificate ?? undefined),
        competency: toJsonValue(payload.competency) ?? undefined,
        cost: payload.cost ?? null,
        approved: payload.approved ?? false,
        approvedAt: payload.approved ? new Date() : null,
        approvedBy: payload.approved ? authorization.userId : null,
        metadata: toJsonValue(payload.metadata) ?? undefined,
    });

    await emitHrNotification(
        {},
        {
            authorization,
            notification: {
                userId: payload.userId,
                title: 'Training assigned',
                message: `${payload.courseName} from ${payload.provider} has been assigned to you.`,
                type: 'training-assigned',
                priority: 'medium',
                actionUrl: '/hr/training',
                metadata: {
                    courseName: payload.courseName,
                    provider: payload.provider,
                    status,
                },
            },
        },
    );

    await invalidateTrainingCache(authorization);

    return { recordCreated: true };
}
