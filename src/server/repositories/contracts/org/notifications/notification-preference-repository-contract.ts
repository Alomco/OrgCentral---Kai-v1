/**
 * Repository contract for Notification Preferences
 * Following SOLID principles with clear separation of concerns
 */
import type { NotificationPreference } from '@/server/types/hr-types';

export interface INotificationPreferenceRepository {
  /**
   * Create a new notification preference
   */
  createNotificationPreference(
    tenantId: string,
    preference: Omit<NotificationPreference, 'id' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing notification preference
   */
  updateNotificationPreference(
    tenantId: string,
    preferenceId: string,
    updates: Partial<Omit<NotificationPreference, 'id' | 'orgId' | 'userId'>>
  ): Promise<void>;

  /**
   * Get a specific notification preference by ID
   */
  getNotificationPreference(
    tenantId: string,
    preferenceId: string
  ): Promise<NotificationPreference | null>;

  /**
   * Get notification preferences for a specific user
   */
  getNotificationPreferencesByUser(
    tenantId: string,
    userId: string
  ): Promise<NotificationPreference[]>;

  /**
   * Get notification preferences for an organization
   */
  getNotificationPreferencesByOrganization(
    tenantId: string,
    filters?: {
      userId?: string;
      channel?: string;
      enabled?: boolean;
    }
  ): Promise<NotificationPreference[]>;

  /**
   * Delete a notification preference
   */
  deleteNotificationPreference(
    tenantId: string,
    preferenceId: string
  ): Promise<void>;

  /**
   * Set default notification preferences for a new user
   */
  setDefaultNotificationPreferences(
    tenantId: string,
    userId: string
  ): Promise<void>;
}
