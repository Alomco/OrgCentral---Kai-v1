import type { IHRNotificationRepository } from '@/server/repositories/contracts/hr/notifications/hr-notification-repository-contract';
import { HrNotificationService, type HrNotificationServiceDependencies } from '@/server/services/hr/notifications/hr-notification-service';
import { createHrNotificationRepository } from '@/server/services/hr/notifications/hr-notification-repository.factory';

export interface HrNotificationCompositionOverrides {
    repository?: IHRNotificationRepository;
}

function buildDependencies(overrides?: HrNotificationCompositionOverrides): HrNotificationServiceDependencies {
    return {
        hrNotificationRepository: overrides?.repository ?? createHrNotificationRepository(),
    };
}

export function getHrNotificationService(overrides?: HrNotificationCompositionOverrides): HrNotificationService {
    return new HrNotificationService(buildDependencies(overrides));
}