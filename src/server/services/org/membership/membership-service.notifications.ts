import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { NotificationComposerContract } from '@/server/repositories/contracts/notifications/notification-composer-contract';
import { appLogger } from '@/server/logging/structured-logger';

export async function sendRoleUpdateNotification(
    composer: NotificationComposerContract | undefined,
    authorization: RepositoryAuthorizationContext,
    targetUserId: string,
    roles: string[],
): Promise<void> {
    if (!composer) {return;}

    await composer
        .composeAndSend({
            authorization,
            notification: {
                userId: targetUserId,
                title: 'Roles Updated',
                body: `Your roles in ${authorization.orgId} have been updated to: ${roles.join(', ')}.`,
                topic: 'system-announcement',
                priority: 'medium',
            },
            abac: {
                action: 'notification.compose',
                resourceType: 'notification',
                resourceAttributes: { targetUserId },
            },
        })
        .catch((error: unknown) => {
            appLogger.error('org.membership.role-update.notification-failed', {
                error,
                targetUserId,
                orgId: authorization.orgId,
            });
        });
}

export async function sendBulkRoleUpdateNotifications(
    composer: NotificationComposerContract | undefined,
    authorization: RepositoryAuthorizationContext,
    targetUserIds: string[],
    roles: string[],
): Promise<void> {
    if (!composer || targetUserIds.length === 0) {return;}

    const notifications = targetUserIds.map((targetUserId) =>
        sendRoleUpdateNotification(composer, authorization, targetUserId, roles),
    );
    await Promise.all(notifications);
}
