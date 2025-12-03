import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRNotificationCreateDTO, HRNotificationDTO } from '@/server/types/hr/notifications';
import { getHrNotificationService, type HrNotificationServiceContract } from '@/server/services/hr/notifications/hr-notification-service.provider';

// Use-case: create an HR notification for a user via HR notification services with guard enforcement.

export interface CreateHrNotificationInput {
    authorization: RepositoryAuthorizationContext;
    notification: Omit<
        HRNotificationCreateDTO,
        'orgId' | 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'
    > &
        Partial<
            Pick<
                HRNotificationCreateDTO,
                'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'
            >
        >;
}

export interface CreateHrNotificationResult {
    notification: HRNotificationDTO;
}

export interface CreateHrNotificationDependencies {
    service?: HrNotificationServiceContract;
}

export async function createHrNotification(
    dependencies: CreateHrNotificationDependencies,
    input: CreateHrNotificationInput,
): Promise<CreateHrNotificationResult> {
    const service = dependencies.service ?? getHrNotificationService();
    return service.createNotification(input);
}
