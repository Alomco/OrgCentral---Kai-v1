import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { IComplianceTemplateRepository } from '@/server/repositories/contracts/hr/compliance/compliance-template-repository-contract';
import type { HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';
import type { NotificationDispatchContract } from '@/server/services/notifications/notification-service.provider';
import { complianceReminderPayloadSchema, type ComplianceReminderPayload } from './reminder.types';
import {
    emitReminder,
    filterByTemplateRules,
    filterTargetUsers,
    groupByUser,
    loadTemplateRules,
} from './reminder.processor.helpers';

interface ComplianceReminderProcessorDeps {
    complianceItemRepository: IComplianceItemRepository;
    complianceTemplateRepository?: IComplianceTemplateRepository;
    notificationService?: HrNotificationServiceContract;
    notificationDispatcher?: NotificationDispatchContract;
}

interface ReminderStats {
    remindersSent: number;
    usersTargeted: number;
}

export class ComplianceReminderProcessor {
    private readonly complianceItemRepository: IComplianceItemRepository;
    private readonly complianceTemplateRepository?: IComplianceTemplateRepository;
    private readonly notificationService?: HrNotificationServiceContract;
    private readonly notificationDispatcher?: NotificationDispatchContract;

    constructor(deps: ComplianceReminderProcessorDeps) {
        this.complianceItemRepository = deps.complianceItemRepository;
        this.complianceTemplateRepository = deps.complianceTemplateRepository;
        this.notificationService = deps.notificationService;
        this.notificationDispatcher = deps.notificationDispatcher;
    }

    async process(
        payload: ComplianceReminderPayload,
        authorization: RepositoryAuthorizationContext,
    ): Promise<ReminderStats> {
        const parsedPayload = complianceReminderPayloadSchema.parse(payload);
        const referenceDate = parsedPayload.referenceDate ?? new Date();
        const fallbackWindowDays = parsedPayload.daysUntilExpiry;

        const templateRules = await loadTemplateRules(this.complianceTemplateRepository, authorization.orgId);
        const configuredMaxReminderDays = Math.max(
            0,
            ...Array.from(templateRules.values()).map((rule) => rule.reminderDaysBeforeExpiry ?? 0),
        );
        const effectiveWindowDays = Math.max(fallbackWindowDays, configuredMaxReminderDays);

        const allItems = await this.complianceItemRepository.findExpiringItemsForOrg(
            authorization.orgId,
            referenceDate,
            effectiveWindowDays,
        );

        const scopedItems = filterTargetUsers(allItems, parsedPayload.targetUserIds);
        const filtered = filterByTemplateRules(scopedItems, templateRules, referenceDate, fallbackWindowDays);
        if (!filtered.length) {
            return { remindersSent: 0, usersTargeted: 0 };
        }

        const grouped = groupByUser(filtered);
        let remindersSent = 0;
        for (const [userId, items] of grouped) {
            await emitReminder({
                complianceItemRepository: this.complianceItemRepository,
                complianceTemplateRepository: this.complianceTemplateRepository,
                notificationDispatcher: this.notificationDispatcher,
                notificationService: this.notificationService,
            }, authorization, userId, items, referenceDate);
            remindersSent += 1;
        }

        return { remindersSent, usersTargeted: grouped.size };
    }
}
