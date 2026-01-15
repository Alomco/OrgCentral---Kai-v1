import { NotificationService, type NotificationServiceDependencies } from './notification.service';
import type {
    NotificationDeliveryContract,
    NotificationDispatchContract,
    NotificationServiceContract,
} from '@/server/repositories/contracts/notifications/notification-dispatch-contract';

const defaultNotificationServiceDependencies: NotificationServiceDependencies = {};

const sharedNotificationService = new NotificationService(defaultNotificationServiceDependencies);

export function getNotificationService(
    overrides?: Partial<NotificationServiceDependencies>,
): NotificationService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedNotificationService;
    }

    return new NotificationService({
        ...defaultNotificationServiceDependencies,
        ...overrides,
    });
}

export type { NotificationDeliveryContract, NotificationDispatchContract, NotificationServiceContract };
