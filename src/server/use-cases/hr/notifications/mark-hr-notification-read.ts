import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRNotificationDTO } from '@/server/types/hr/notifications';
import {
    getHrNotificationService,
    type HrNotificationServiceContract,
} from '@/server/services/hr/notifications/hr-notification-service.provider';

// Use-case: mark a single HR notification as read using HR notification services.

export interface MarkHrNotificationReadInput {
    authorization: RepositoryAuthorizationContext;
    notificationId: string;
    readAt?: Date | string;
}

export interface MarkHrNotificationReadResult {
    notification: HRNotificationDTO;
}

export interface MarkHrNotificationReadDependencies {
    service?: HrNotificationServiceContract;
}

export async function markHrNotificationRead(
    dependencies: MarkHrNotificationReadDependencies,
    input: MarkHrNotificationReadInput,
): Promise<MarkHrNotificationReadResult> {
    const service = dependencies.service ?? getHrNotificationService();
    return service.markNotificationRead(input);
}
