import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getHrNotificationService } from '@/server/services/hr/notifications/hr-notification-service.provider';
import { invalidateHrNotifications } from '@/server/lib/cache-tags/hr-notifications';
import type { MarkAllNotificationsReadResult } from '@/server/services/hr/notifications/hr-notification-service';

export interface MarkAllHrNotificationsReadActionInput {
    authorization: RepositoryAuthorizationContext;
    before?: Date | string;
    userId?: string;
}

// API adapter: mark all HR notifications as read for a user via HrNotificationService and invalidate cache.
export async function markAllHrNotificationsReadAction(
    input: MarkAllHrNotificationsReadActionInput,
): Promise<MarkAllNotificationsReadResult> {
    const service = getHrNotificationService();
    const result = await service.markAllNotificationsRead(input);

    await invalidateHrNotifications({
        orgId: input.authorization.orgId,
        classification: input.authorization.dataClassification,
        residency: input.authorization.dataResidency,
    });

    return result;
}
