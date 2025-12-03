import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    getHrNotificationService,
    type HrNotificationServiceContract,
} from '@/server/services/hr/notifications/hr-notification-service.provider';

// Use-case: delete an HR notification via HR notification services under tenant guard.

export interface DeleteHrNotificationInput {
    authorization: RepositoryAuthorizationContext;
    notificationId: string;
}

export interface DeleteHrNotificationResult {
    success: true;
}

export interface DeleteHrNotificationDependencies {
    service?: HrNotificationServiceContract;
}

export async function deleteHrNotification(
    dependencies: DeleteHrNotificationDependencies,
    input: DeleteHrNotificationInput,
): Promise<DeleteHrNotificationResult> {
    const service = dependencies.service ?? getHrNotificationService();
    return service.deleteNotification(input);
}
