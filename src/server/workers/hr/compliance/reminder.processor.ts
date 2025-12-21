import { differenceInCalendarDays } from 'date-fns';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import type { HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';
import type { NotificationDispatchContract } from '@/server/services/notifications/notification-service.provider';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { complianceReminderPayloadSchema, type ComplianceReminderPayload } from './reminder.types';

interface ComplianceReminderProcessorDeps {
    complianceItemRepository: IComplianceItemRepository;
    notificationService?: HrNotificationServiceContract;
    notificationDispatcher?: NotificationDispatchContract;
}

interface ReminderStats {
    remindersSent: number;
    usersTargeted: number;
}

export class ComplianceReminderProcessor {
    private readonly complianceItemRepository: IComplianceItemRepository;
    private readonly notificationService?: HrNotificationServiceContract;
    private readonly notificationDispatcher?: NotificationDispatchContract;

    constructor(deps: ComplianceReminderProcessorDeps) {
        this.complianceItemRepository = deps.complianceItemRepository;
        this.notificationService = deps.notificationService;
        this.notificationDispatcher = deps.notificationDispatcher;
    }

    async process(
        payload: ComplianceReminderPayload,
        authorization: RepositoryAuthorizationContext,
    ): Promise<ReminderStats> {
        const parsedPayload = complianceReminderPayloadSchema.parse(payload);
        const referenceDate = parsedPayload.referenceDate ?? new Date();
        const daysUntilExpiry = parsedPayload.daysUntilExpiry;
        const allItems = await this.complianceItemRepository.findExpiringItemsForOrg(
            authorization.orgId,
            referenceDate,
            daysUntilExpiry,
        );

        const scopedItems = this.filterTargetUsers(allItems, parsedPayload.targetUserIds);
        if (!scopedItems.length) {
            return { remindersSent: 0, usersTargeted: 0 };
        }

        const grouped = this.groupByUser(scopedItems);
        let remindersSent = 0;
        for (const [userId, items] of grouped) {
            await this.emitReminder(userId, items, referenceDate, authorization);
            remindersSent += 1;
        }

        return { remindersSent, usersTargeted: grouped.size };
    }

    private filterTargetUsers(items: ComplianceLogItem[], targetUserIds?: string[]): ComplianceLogItem[] {
        if (!targetUserIds || targetUserIds.length === 0) {
            return items;
        }
        const targets = new Set(targetUserIds);
        return items.filter((item) => targets.has(item.userId));
    }

    private groupByUser(items: ComplianceLogItem[]): Map<string, ComplianceLogItem[]> {
        return items.reduce<Map<string, ComplianceLogItem[]>>((accumulator, item) => {
            const existing = accumulator.get(item.userId) ?? [];
            existing.push(item);
            accumulator.set(item.userId, existing);
            return accumulator;
        }, new Map());
    }

    private async emitReminder(
        userId: string,
        items: ComplianceLogItem[],
        referenceDate: Date,
        authorization: RepositoryAuthorizationContext,
    ): Promise<void> {
        const sorted = [...items].sort((a, b) => {
            const aTime = a.dueDate ? a.dueDate.getTime() : Number.POSITIVE_INFINITY;
            const bTime = b.dueDate ? b.dueDate.getTime() : Number.POSITIVE_INFINITY;
            return aTime - bTime;
        });
        const nearestDue = sorted[0]?.dueDate ?? referenceDate;
        const daysUntilDue = Math.max(0, differenceInCalendarDays(nearestDue, referenceDate));
        const priority = this.resolvePriority(daysUntilDue);
        const title =
            daysUntilDue <= 1
                ? 'Compliance task due now'
                : `Compliance tasks due in ${String(daysUntilDue)} days`;
        const message = this.buildMessage(items.length, nearestDue);

        await emitHrNotification(
            { service: this.notificationService },
            {
                authorization,
                notification: {
                    userId,
                    title,
                    message,
                    type: 'compliance-reminder',
                    priority,
                    metadata: {
                        items: items.map((item) => ({
                            itemId: item.id,
                            templateItemId: item.templateItemId,
                            categoryKey: item.categoryKey,
                            dueDate: item.dueDate?.toISOString() ?? null,
                            status: item.status,
                        })),
                        referenceDate: referenceDate.toISOString(),
                    },
                },
            },
        );

        await this.dispatchRealtimeNotification(userId, {
            authorization,
            title,
            message,
            priority,
            referenceDate,
            items,
        });
    }

    private async dispatchRealtimeNotification(
        userId: string,
        params: {
            authorization: RepositoryAuthorizationContext;
            title: string;
            message: string;
            priority: 'urgent' | 'high' | 'medium';
            referenceDate: Date;
            items: ComplianceLogItem[];
        },
    ): Promise<void> {
        if (!this.notificationDispatcher) {
            return;
        }

        await this.notificationDispatcher.dispatchNotification({
            authorization: params.authorization,
            notification: {
                templateKey: 'hr.compliance.reminder',
                channel: 'IN_APP',
                recipient: { userId },
                data: {
                    title: params.title,
                    message: params.message,
                    priority: params.priority,
                    referenceDate: params.referenceDate.toISOString(),
                    itemCount: params.items.length,
                    items: params.items.map((item) => ({
                        itemId: item.id,
                        templateItemId: item.templateItemId,
                        categoryKey: item.categoryKey,
                        dueDate: item.dueDate?.toISOString() ?? null,
                        status: item.status,
                    })),
                },
            },
        });
    }

    private resolvePriority(daysUntilDue: number) {
        if (daysUntilDue <= 1) {
            return 'urgent' as const;
        }
        if (daysUntilDue <= 3) {
            return 'high' as const;
        }
        return 'medium' as const;
    }

    private buildMessage(itemCount: number, dueDate: Date): string {
        const formatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' });
        const dateLabel = formatter.format(dueDate);
        const noun = itemCount === 1 ? 'task' : 'tasks';
        return `You have ${String(itemCount)} compliance ${noun} due by ${dateLabel}. Review the compliance workspace to upload the required evidence.`;
    }
}
