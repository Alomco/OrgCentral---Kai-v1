import type { NotificationDispatchContract } from '@/server/repositories/contracts/notifications/notification-dispatch-contract';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SupportTicket } from '@/server/types/platform/support-tickets';
import { appLogger } from '@/server/logging/structured-logger';

interface SupportTicketNotificationContext {
    dispatcher?: NotificationDispatchContract;
    authorization: RepositoryAuthorizationContext;
    ticket: SupportTicket;
}

export async function sendSupportTicketCreateNotifications(input: SupportTicketNotificationContext): Promise<void> {
    const { dispatcher, authorization, ticket } = input;
    if (!dispatcher) {
        return;
    }

    await dispatchSafely(dispatcher, authorization, {
        templateKey: 'platform.support.ticket.created',
        channel: 'EMAIL',
        recipient: { email: ticket.requesterEmail },
        data: {
            ticketId: ticket.id,
            tenantId: ticket.tenantId,
            severity: ticket.severity,
            status: ticket.status,
        },
    });
}

export async function sendSupportTicketUpdateNotifications(
    input: SupportTicketNotificationContext,
    changedFields: readonly string[],
): Promise<void> {
    const { dispatcher, authorization, ticket } = input;
    if (!dispatcher) {
        return;
    }

    const baseData = {
        ticketId: ticket.id,
        tenantId: ticket.tenantId,
        severity: ticket.severity,
        status: ticket.status,
        changedFields: [...changedFields],
    };

    await dispatchSafely(dispatcher, authorization, {
        templateKey: 'platform.support.ticket.updated',
        channel: 'EMAIL',
        recipient: { email: ticket.requesterEmail },
        data: baseData,
    });

    if (ticket.assignedTo) {
        await dispatchSafely(dispatcher, authorization, {
            templateKey: 'platform.support.ticket.updated',
            channel: 'IN_APP',
            recipient: { userId: ticket.assignedTo },
            data: baseData,
        });
    }
}

export async function sendSupportTicketSlaBreachNotifications(
    input: SupportTicketNotificationContext,
): Promise<void> {
    const { dispatcher, authorization, ticket } = input;
    if (!dispatcher) {
        return;
    }

    const breachAt =
        ticket.metadata && typeof ticket.metadata.slaBreachedAt === 'string'
            ? ticket.metadata.slaBreachedAt
            : ticket.updatedAt;

    const baseData = {
        ticketId: ticket.id,
        tenantId: ticket.tenantId,
        severity: ticket.severity,
        status: ticket.status,
        breachedAt: breachAt,
    };

    await dispatchSafely(dispatcher, authorization, {
        templateKey: 'platform.support.ticket.sla-breached',
        channel: 'EMAIL',
        recipient: { email: ticket.requesterEmail },
        data: baseData,
    });

    if (ticket.assignedTo) {
        await dispatchSafely(dispatcher, authorization, {
            templateKey: 'platform.support.ticket.sla-breached',
            channel: 'IN_APP',
            recipient: { userId: ticket.assignedTo },
            data: baseData,
        });
    }
}

async function dispatchSafely(
    dispatcher: NotificationDispatchContract,
    authorization: RepositoryAuthorizationContext,
    notification: {
        templateKey: string;
        channel: 'EMAIL' | 'IN_APP';
        recipient: { userId?: string; email?: string };
        data: Record<string, string | string[]>;
    },
): Promise<void> {
    try {
        await dispatcher.dispatchNotification({
            authorization,
            notification,
        });
    } catch (error) {
        appLogger.error('support.ticket.notification.dispatch.failed', {
            orgId: authorization.orgId,
            templateKey: notification.templateKey,
            channel: notification.channel,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
