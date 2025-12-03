import { PrismaHRNotificationRepository } from '@/server/repositories/prisma/hr/notifications';
import { HrNotificationService, type HrNotificationServiceDependencies } from './hr-notification-service';

const hrNotificationRepository = new PrismaHRNotificationRepository();

const defaultNotificationServiceDependencies: HrNotificationServiceDependencies = {
    hrNotificationRepository,
};

const sharedNotificationService = new HrNotificationService(defaultNotificationServiceDependencies);

export function getHrNotificationService(
    overrides?: Partial<HrNotificationServiceDependencies>,
): HrNotificationService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedNotificationService;
    }

    return new HrNotificationService({
        ...defaultNotificationServiceDependencies,
        ...overrides,
    });
}

export type HrNotificationServiceContract = Pick<
    HrNotificationService,
    | 'createNotification'
    | 'listNotifications'
    | 'markNotificationRead'
    | 'markAllNotificationsRead'
    | 'deleteNotification'
>;
