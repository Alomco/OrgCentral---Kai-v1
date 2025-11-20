import type { HRNotification } from '@/server/types/hr-ops-types';

export interface IHRNotificationRepository {
  createNotification(orgId: string, input: Omit<HRNotification, 'id' | 'isRead' | 'readAt' | 'createdAt'> & { isRead?: boolean; readAt?: Date | null }): Promise<HRNotification>;
  markRead(orgId: string, notificationId: string, readAt?: Date): Promise<HRNotification>;
  markAllRead(orgId: string, userId: string, before?: Date): Promise<number>;
  listNotifications(orgId: string, userId: string, filters?: { unreadOnly?: boolean; since?: Date; until?: Date }): Promise<HRNotification[]>;
  deleteNotification(orgId: string, notificationId: string): Promise<void>;
}
