import type {
  HRNotificationCreateDTO,
  HRNotificationDTO,
  HRNotificationListFilters,
} from '@/server/types/hr/notifications';

export interface IHRNotificationRepository {
  createNotification(orgId: string, input: HRNotificationCreateDTO): Promise<HRNotificationDTO>;
  markRead(orgId: string, notificationId: string, readAt?: Date): Promise<HRNotificationDTO>;
  markAllRead(orgId: string, userId: string, before?: Date): Promise<number>;
  listNotifications(
    orgId: string,
    userId: string,
    filters?: HRNotificationListFilters,
  ): Promise<HRNotificationDTO[]>;
  getUnreadCount(orgId: string, userId: string): Promise<number>;
  deleteNotification(orgId: string, notificationId: string): Promise<void>;
}
