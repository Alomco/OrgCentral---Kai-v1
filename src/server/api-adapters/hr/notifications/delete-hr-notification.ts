import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getHrNotificationService } from '@/server/services/hr/notifications/hr-notification-service.provider';
import { invalidateHrNotifications } from '@/server/lib/cache-tags/hr-notifications';

export interface DeleteHrNotificationActionInput {
    authorization: RepositoryAuthorizationContext;
    notificationId: string;
}

// API adapter: delete an HR notification via HrNotificationService under tenant guard and invalidate cache.
export async function deleteHrNotificationAction(
    input: DeleteHrNotificationActionInput,
): Promise<{ success: true }> {
    const service = getHrNotificationService();
    const result = await service.deleteNotification(input);

    await invalidateHrNotifications({
        orgId: input.authorization.orgId,
        classification: input.authorization.dataClassification,
        residency: input.authorization.dataResidency,
    });

    return result;
}
