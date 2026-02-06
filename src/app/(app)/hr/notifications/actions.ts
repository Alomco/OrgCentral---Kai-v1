'use server';

import { z } from 'zod';
import { headers } from 'next/headers';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';

import { toActionState, type ActionState } from '@/server/actions/action-state';
import { authAction } from '@/server/actions/auth-action';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { buildHrAuthActionOptions } from '@/server/ui/auth/hr-session';
import { markHrNotificationReadAction as markReadAdapter } from '@/server/api-adapters/hr/notifications/mark-hr-notification-read';
import { markAllHrNotificationsReadAction as markAllReadAdapter } from '@/server/api-adapters/hr/notifications/mark-all-hr-notifications-read';
import { deleteHrNotificationAction as deleteAdapter } from '@/server/api-adapters/hr/notifications/delete-hr-notification';
import { getHrNotificationsAction } from '@/server/api-adapters/hr/notifications/get-hr-notifications';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { HRNotificationDTO, HRNotificationTypeCode } from '@/server/types/hr/notifications';
import { HR_NOTIFICATION_TYPE_VALUES } from '@/server/types/hr/notifications';
import { notificationFilterSchema, type NotificationFilters } from './_schemas/filter-schema';
import type { NotificationSummary } from '@/components/notifications/notification-item';

const AUDIT_PREFIX = 'action:hr:notifications';
const NOTIFICATIONS_PATH = '/hr/notifications';
const NOTIFICATIONS_LIMIT = 50;
const VALID_NOTIFICATION_TYPES = new Set<HRNotificationTypeCode>(HR_NOTIFICATION_TYPE_VALUES);

const markReadSchema = z.object({
  notificationId: z.string(),
});

const markAllReadSchema = z.object({
  before: z.iso.datetime().optional(),
});

const deleteSchema = z.object({
  notificationId: z.string(),
});

function normalizeNotificationType(type: string): HRNotificationTypeCode {
  if (VALID_NOTIFICATION_TYPES.has(type as HRNotificationTypeCode)) {
    return type as HRNotificationTypeCode;
  }
  return 'other';
}

export async function listHrNotifications(
  input: Partial<NotificationFilters> = {},
): Promise<{ notifications: NotificationSummary[]; unreadCount: number }> {
  const headerStore = await headers();
  const { authorization, session } = await getSessionContext(
    {},
    {
      headers: headerStore,
      requiredPermissions: HR_PERMISSION_PROFILE.NOTIFICATION_LIST,
      auditSource: `${AUDIT_PREFIX}:list`,
      action: HR_ACTION.LIST,
      resourceType: HR_RESOURCE_TYPE.NOTIFICATION,
      resourceAttributes: { view: 'list' },
    },
  );

  const filters = notificationFilterSchema.parse(input);
  const limit = Math.min(filters.limit ?? NOTIFICATIONS_LIMIT, NOTIFICATIONS_LIMIT);
  const result = await getHrNotificationsAction({
    authorization,
    userId: session.user.id,
    filters: {
      unreadOnly: filters.unreadOnly,
      types: filters.type ? [filters.type] : undefined,
      priorities: filters.priority ? [filters.priority] : undefined,
      limit,
    },
  });

  const notifications = result.notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: normalizeNotificationType(notification.type),
    priority: notification.priority,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    actionUrl: notification.actionUrl ?? undefined,
    actionLabel: notification.actionLabel ?? undefined,
  }));
  const query = filters.q?.trim().toLowerCase();
  const filteredNotifications = query
    ? notifications.filter((notification) => {
      const haystack = [notification.title, notification.message, notification.actionLabel]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase());
      return haystack.some((value) => value.includes(query));
    })
    : notifications;

  return { notifications: filteredNotifications, unreadCount: result.unreadCount };
}

export async function markHrNotificationRead(
  input: z.infer<typeof markReadSchema>,
): Promise<ActionState<{ notification: HRNotificationDTO }>> {
  const parsed = markReadSchema.parse(input);

  return toActionState(() =>
    authAction(
      buildHrAuthActionOptions({
        requiredPermissions: HR_PERMISSION_PROFILE.NOTIFICATION_MANAGE,
        auditSource: `${AUDIT_PREFIX}:mark-read`,
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE_TYPE.NOTIFICATION,
        resourceAttributes: { notificationId: parsed.notificationId },
      }),
      async ({ authorization }) => {
        const result = await markReadAdapter({
          authorization,
          notificationId: parsed.notificationId,
          readAt: new Date(),
        });

        after(() => {
          revalidatePath(NOTIFICATIONS_PATH);
        });

        return result;
      }
    )
  );
}

export async function markAllHrNotificationsRead(
  input: z.infer<typeof markAllReadSchema> = {},
): Promise<ActionState<{ count: number }>> {
  const parsed = markAllReadSchema.parse(input);

  return toActionState(() =>
    authAction(
      buildHrAuthActionOptions({
        requiredPermissions: HR_PERMISSION_PROFILE.NOTIFICATION_MANAGE,
        auditSource: `${AUDIT_PREFIX}:mark-all-read`,
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE_TYPE.NOTIFICATION,
        resourceAttributes: { view: 'list' },
      }),
      async ({ authorization }) => {
        const result = await markAllReadAdapter({
          authorization,
          before: parsed.before,
        });

        after(() => {
          revalidatePath(NOTIFICATIONS_PATH);
        });

        return { count: result.updatedCount };
      }
    )
  );
}

export async function deleteHrNotification(
  input: z.infer<typeof deleteSchema>,
): Promise<ActionState<{ success: true }>> {
  const parsed = deleteSchema.parse(input);

  return toActionState(() =>
    authAction(
      buildHrAuthActionOptions({
        requiredPermissions: HR_PERMISSION_PROFILE.NOTIFICATION_MANAGE,
        auditSource: `${AUDIT_PREFIX}:delete`,
        action: HR_ACTION.DELETE,
        resourceType: HR_RESOURCE_TYPE.NOTIFICATION,
        resourceAttributes: { notificationId: parsed.notificationId },
      }),
      async ({ authorization }) => {
        const result = await deleteAdapter({
          authorization,
          notificationId: parsed.notificationId,
        });

        after(() => {
          revalidatePath(NOTIFICATIONS_PATH);
        });

        return result;
      }
    )
  );
}
