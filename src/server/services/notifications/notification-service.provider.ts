import { NotificationService, type NotificationServiceDependencies } from './notification.service';

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

export type NotificationServiceContract = Pick<NotificationService, 'dispatchNotification' | 'sendNotification'>;
export type NotificationDispatchContract = Pick<NotificationService, 'dispatchNotification'>;
export type NotificationDeliveryContract = Pick<NotificationService, 'sendNotification'>;
