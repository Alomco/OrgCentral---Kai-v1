import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    getHrNotificationService,
    type HrNotificationServiceContract,
} from '@/server/services/hr/notifications/hr-notification-service.provider';
import type { MarkAllNotificationsReadResult } from '@/server/services/hr/notifications/hr-notification-service';

// Use-case: mark all HR notifications as read for a user via HR notification services.

export interface MarkAllHrNotificationsReadInput {
    authorization: RepositoryAuthorizationContext;
    before?: Date | string;
    userId?: string;
}

export interface MarkAllHrNotificationsReadDependencies {
    service?: HrNotificationServiceContract;
}

export async function markAllHrNotificationsRead(
    dependencies: MarkAllHrNotificationsReadDependencies,
    input: MarkAllHrNotificationsReadInput,
): Promise<MarkAllNotificationsReadResult> {
    const service = dependencies.service ?? getHrNotificationService();
    return service.markAllNotificationsRead(input);
}
