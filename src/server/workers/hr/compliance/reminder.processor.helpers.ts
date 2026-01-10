import { differenceInCalendarDays } from 'date-fns';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { IComplianceTemplateRepository } from '@/server/repositories/contracts/hr/compliance/compliance-template-repository-contract';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import type { HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';
import type { NotificationDispatchContract } from '@/server/services/notifications/notification-service.provider';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';

export const NOTIFICATION_TYPE_DOCUMENT_EXPIRY = 'document-expiry' as const;
export const NOTIFICATION_TYPE_COMPLIANCE_REMINDER = 'compliance-reminder' as const;

export interface ReminderHelperDeps {
  complianceTemplateRepository?: IComplianceTemplateRepository;
  notificationService?: HrNotificationServiceContract;
  notificationDispatcher?: NotificationDispatchContract;
  complianceItemRepository: IComplianceItemRepository;
}

export async function loadTemplateRules(
  repository: IComplianceTemplateRepository | undefined,
  orgId: string,
): Promise<Map<string, { reminderDaysBeforeExpiry?: number | null }>> {
  if (!repository) {
    return new Map();
  }

  const templates = await repository.listTemplates(orgId);
  const rules = new Map<string, { reminderDaysBeforeExpiry?: number | null }>();
  for (const template of templates) {
    for (const item of template.items) {
      rules.set(item.id, { reminderDaysBeforeExpiry: item.reminderDaysBeforeExpiry ?? null });
    }
  }
  return rules;
}

export function filterTargetUsers(items: ComplianceLogItem[], targetUserIds?: string[]): ComplianceLogItem[] {
  if (!targetUserIds || targetUserIds.length === 0) {
    return items;
  }
  const targets = new Set(targetUserIds);
  return items.filter((item) => targets.has(item.userId));
}

export function filterByTemplateRules(
  items: ComplianceLogItem[],
  templateRules: Map<string, { reminderDaysBeforeExpiry?: number | null }>,
  referenceDate: Date,
  fallbackWindowDays: number,
): ComplianceLogItem[] {
  return items.filter((item) => {
    const dueDate = item.dueDate;
    if (!dueDate) {
      return false;
    }

    const daysUntilDue = differenceInCalendarDays(dueDate, referenceDate);
    if (daysUntilDue <= 0) {
      return true;
    }

    const rule = templateRules.get(item.templateItemId);
    const reminderDays = rule?.reminderDaysBeforeExpiry;

    if (typeof reminderDays === 'number' && Number.isFinite(reminderDays) && reminderDays > 0) {
      return daysUntilDue === reminderDays;
    }

    return daysUntilDue <= fallbackWindowDays;
  });
}

export function groupByUser(items: ComplianceLogItem[]): Map<string, ComplianceLogItem[]> {
  return items.reduce<Map<string, ComplianceLogItem[]>>((accumulator, item) => {
    const existing = accumulator.get(item.userId) ?? [];
    existing.push(item);
    accumulator.set(item.userId, existing);
    return accumulator;
  }, new Map());
}

export async function emitReminder(
  deps: ReminderHelperDeps,
  authorization: RepositoryAuthorizationContext,
  userId: string,
  items: ComplianceLogItem[],
  referenceDate: Date,
): Promise<void> {
  const expiringDocuments = items.filter((item) => item.status === 'COMPLETE');
  const pendingTasks = items.filter((item) => item.status !== 'COMPLETE');

  if (expiringDocuments.length > 0) {
    await sendNotification({
      deps,
      userId,
      items: expiringDocuments,
      referenceDate,
      authorization,
      type: NOTIFICATION_TYPE_DOCUMENT_EXPIRY,
    });
  }

  if (pendingTasks.length > 0) {
    await sendNotification({
      deps,
      userId,
      items: pendingTasks,
      referenceDate,
      authorization,
      type: NOTIFICATION_TYPE_COMPLIANCE_REMINDER,
    });
  }
}

async function sendNotification(params: {
  deps: ReminderHelperDeps;
  userId: string;
  items: ComplianceLogItem[];
  referenceDate: Date;
  authorization: RepositoryAuthorizationContext;
  type: typeof NOTIFICATION_TYPE_COMPLIANCE_REMINDER | typeof NOTIFICATION_TYPE_DOCUMENT_EXPIRY;
}): Promise<void> {
  const { deps, userId, items, referenceDate, authorization, type } = params;
  const sorted = [...items].sort((a, b) => {
    const aTime = a.dueDate ? a.dueDate.getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.dueDate ? b.dueDate.getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
  const nearestDue = sorted[0]?.dueDate ?? referenceDate;
  const daysUntilDue = Math.max(0, differenceInCalendarDays(nearestDue, referenceDate));
  const priority = resolvePriority(daysUntilDue);

  const title = type === NOTIFICATION_TYPE_DOCUMENT_EXPIRY
    ? daysUntilDue <= 1
      ? 'Document expiring now'
      : `Document expiring in ${String(daysUntilDue)} days`
    : daysUntilDue <= 1
      ? 'Compliance task due now'
      : `Compliance tasks due in ${String(daysUntilDue)} days`;

  const message = buildMessage(items.length, nearestDue, type);

  await emitHrNotification(
    { service: deps.notificationService },
    {
      authorization,
      notification: {
        userId,
        title,
        message,
        type,
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

  await dispatchRealtimeNotification(deps.notificationDispatcher, authorization, userId, {
    title,
    message,
    priority,
    referenceDate,
    items,
  });
}

async function dispatchRealtimeNotification(
  dispatcher: NotificationDispatchContract | undefined,
  authorization: RepositoryAuthorizationContext,
  userId: string,
  params: {
    title: string;
    message: string;
    priority: 'urgent' | 'high' | 'medium';
    referenceDate: Date;
    items: ComplianceLogItem[];
  },
): Promise<void> {
  if (!dispatcher) {
    return;
  }

  await dispatcher.dispatchNotification({
    authorization,
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

function resolvePriority(daysUntilDue: number) {
  if (daysUntilDue <= 1) {
    return 'urgent' as const;
  }
  if (daysUntilDue <= 3) {
    return 'high' as const;
  }
  return 'medium' as const;
}

function buildMessage(
  itemCount: number,
  dueDate: Date,
  type: typeof NOTIFICATION_TYPE_COMPLIANCE_REMINDER | typeof NOTIFICATION_TYPE_DOCUMENT_EXPIRY,
): string {
  const formatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' });
  const dateLabel = formatter.format(dueDate);
  const noun = itemCount === 1 ? 'task' : 'tasks';

  if (type === NOTIFICATION_TYPE_DOCUMENT_EXPIRY) {
    const documentNoun = itemCount === 1 ? 'document is' : 'documents are';
    return `You have ${String(itemCount)} compliance ${documentNoun} expiring by ${dateLabel}. Please review and renew if necessary.`;
  }

  return `You have ${String(itemCount)} compliance ${noun} due by ${dateLabel}. Review the compliance workspace to upload the required evidence.`;
}
