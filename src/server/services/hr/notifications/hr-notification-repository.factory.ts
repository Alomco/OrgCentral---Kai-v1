import { createHrNotificationRepository as buildHrNotificationRepository } from '@/server/repositories/providers/hr/hr-notification-repository-provider';

export function createHrNotificationRepository() {
    return buildHrNotificationRepository();
}
