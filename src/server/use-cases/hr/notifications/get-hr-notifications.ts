import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRNotificationDTO, HRNotificationListFilters } from '@/server/types/hr/notifications';
import { getHrNotificationService, type HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';

// Use-case: list HR notifications for a user or org through HR notification services with filters.

export interface GetHrNotificationsInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
    filters?: HRNotificationListFilters;
}

export interface GetHrNotificationsResult {
    notifications: HRNotificationDTO[];
    unreadCount: number;
}

export interface GetHrNotificationsDependencies {
    service?: HrNotificationServiceContract;
}

export async function getHrNotifications(
    dependencies: GetHrNotificationsDependencies,
    input: GetHrNotificationsInput,
): Promise<GetHrNotificationsResult> {
    const service = dependencies.service ?? getHrNotificationService();
    return service.listNotifications(input);
}
