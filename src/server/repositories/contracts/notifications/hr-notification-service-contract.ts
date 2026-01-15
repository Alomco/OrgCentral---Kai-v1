import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRNotificationCreateDTO, HRNotificationDTO } from '@/server/types/hr/notifications';

export interface HrNotificationCreateInput {
    authorization: RepositoryAuthorizationContext;
    notification: Omit<
        HRNotificationCreateDTO,
        'orgId' | 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'
    > &
        Partial<Pick<HRNotificationCreateDTO, 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'>>;
}

export interface HrNotificationCreateResult {
    notification: HRNotificationDTO;
}

export interface HrNotificationServiceContract {
    createNotification(input: HrNotificationCreateInput): Promise<HrNotificationCreateResult>;
}
