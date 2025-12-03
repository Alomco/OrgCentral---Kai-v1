import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRNotificationCreateDTO, HRNotificationDTO } from '@/server/types/hr/notifications';
import {
    getHrNotificationService,
    type HrNotificationServiceContract,
} from '@/server/services/hr/notifications/hr-notification-service.provider';

export interface EmitHrNotificationInput {
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

export interface EmitHrNotificationDependencies {
    service?: HrNotificationServiceContract;
}

/**
 * Shared emitter wrapper to publish HR notifications via the service layer.
 * Centralizes defaulting of classification/residency/audit fields.
 */
export async function emitHrNotification(
    deps: EmitHrNotificationDependencies,
    input: EmitHrNotificationInput,
): Promise<HRNotificationDTO> {
    const service = deps.service ?? getHrNotificationService();
    const result = await service.createNotification(input);
    return result.notification;
}
