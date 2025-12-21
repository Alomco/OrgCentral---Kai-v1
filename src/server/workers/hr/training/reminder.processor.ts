import { trainingReminderPayloadSchema, type TrainingReminderPayload } from './reminder.types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { PrismaTrainingRecordRepository } from '@/server/repositories/prisma/hr/training';
import type { TrainingRecordFilters } from '@/server/repositories/prisma/hr/training/prisma-training-record-repository.types';
import { getHrNotificationService } from '@/server/services/hr/notifications/hr-notification-service.provider';
import type { HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';

export interface TrainingReminderProcessorResult {
    remindersSent: number;
    usersTargeted: number;
}

export interface TrainingReminderProcessorDependencies {
    trainingRepository?: PrismaTrainingRecordRepository;
    notificationService?: HrNotificationServiceContract;
    now?: () => Date;
}

export class TrainingReminderProcessor {
    private readonly trainingRepository: PrismaTrainingRecordRepository;
    private readonly notificationService: HrNotificationServiceContract;
    private readonly now: () => Date;

    constructor(deps?: TrainingReminderProcessorDependencies) {
        this.trainingRepository = deps?.trainingRepository ?? new PrismaTrainingRecordRepository();
        this.notificationService = deps?.notificationService ?? getHrNotificationService();
        this.now = deps?.now ?? (() => new Date());
    }

    async process(
        payload: TrainingReminderPayload,
        authorization: RepositoryAuthorizationContext,
    ): Promise<TrainingReminderProcessorResult> {
        const parsedPayload = trainingReminderPayloadSchema.parse(payload);
        const referenceDate = parsedPayload.referenceDate ?? this.now();
        const dueBefore = this.addDays(referenceDate, parsedPayload.daysUntilExpiry);

        const filters: TrainingRecordFilters = {
            orgId: authorization.orgId,
            expiryAfter: referenceDate,
            expiryBefore: dueBefore,
            userId:
                parsedPayload.targetUserIds?.length === 1
                    ? parsedPayload.targetUserIds[0]
                    : undefined,
        };

        const dueRecordsRaw = await this.trainingRepository.findAll(filters);
        const includeOverdue = parsedPayload.includeOverdue;
        const overdueRecords = includeOverdue
            ? await this.trainingRepository.findAll({
                orgId: authorization.orgId,
                expiryBefore: referenceDate,
                userId: filters.userId,
            })
            : [];

        const targetSet = parsedPayload.targetUserIds ? new Set(parsedPayload.targetUserIds) : null;
        const dueRecords = targetSet
            ? dueRecordsRaw.filter((record) => targetSet.has(record.userId))
            : dueRecordsRaw;
        const filteredOverdue = targetSet
            ? overdueRecords.filter((record) => targetSet.has(record.userId))
            : overdueRecords;

        let remindersSent = 0;
        const targetedUsers = new Set<string>();

        for (const record of dueRecords) {
            await this.notify(authorization, record.userId, {
                title: 'Training expiring soon',
                message: `${record.courseName} expires on ${this.formatDate(record.expiryDate) ?? 'soon'}.`,
                type: 'training-due',
                priority: 'medium',
                actionUrl: `/hr/training/${record.id}`,
                metadata: {
                    recordId: record.id,
                    courseName: record.courseName,
                    expiryDate: record.expiryDate ?? null,
                    status: record.status,
                },
            });
            remindersSent += 1;
            targetedUsers.add(record.userId);
        }

        for (const record of filteredOverdue) {
            await this.notify(authorization, record.userId, {
                title: 'Training overdue',
                message: `${record.courseName} has expired.`,
                type: 'training-overdue',
                priority: 'high',
                actionUrl: `/hr/training/${record.id}`,
                metadata: {
                    recordId: record.id,
                    courseName: record.courseName,
                    expiryDate: record.expiryDate ?? null,
                    status: record.status,
                },
            });
            remindersSent += 1;
            targetedUsers.add(record.userId);
        }

        return { remindersSent, usersTargeted: targetedUsers.size };
    }

    private async notify(
        authorization: RepositoryAuthorizationContext,
        userId: string,
        notification: Omit<
            Parameters<HrNotificationServiceContract['createNotification']>[0]['notification'],
            'userId' | 'orgId' | 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'
        >,
    ): Promise<void> {
        await emitHrNotification(
            { service: this.notificationService },
            {
                authorization,
                notification: {
                    ...notification,
                    userId,
                    dataClassification: authorization.dataClassification,
                    residencyTag: authorization.dataResidency,
                },
            },
        );
    }

    private addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private formatDate(value: Date | null): string | null {
        if (!value) {
            return null;
        }
        return value.toISOString().slice(0, 10);
    }
}
