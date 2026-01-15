import type {
  HRNotificationCreateDTO,
  HRNotificationDTO,
  HRNotificationListFilters,
} from '@/server/types/hr/notifications';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface IHRNotificationRepository {
  createNotification(contextOrOrgId: RepositoryAuthorizationContext | string, input: HRNotificationCreateDTO): Promise<HRNotificationDTO>;
  markRead(contextOrOrgId: RepositoryAuthorizationContext | string, notificationId: string, readAt?: Date): Promise<HRNotificationDTO>;
  markAllRead(contextOrOrgId: RepositoryAuthorizationContext | string, userId: string, before?: Date): Promise<number>;
  listNotifications(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    userId: string,
    filters?: HRNotificationListFilters,
  ): Promise<HRNotificationDTO[]>;
  getUnreadCount(contextOrOrgId: RepositoryAuthorizationContext | string, userId: string): Promise<number>;
  deleteNotification(contextOrOrgId: RepositoryAuthorizationContext | string, notificationId: string): Promise<void>;
}
