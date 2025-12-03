import type { DataClassificationLevel, DataResidencyZone } from '../tenant';

export const HR_NOTIFICATION_TYPE_VALUES = [
  'leave-approval',
  'leave-rejection',
  'document-expiry',
  'policy-update',
  'performance-review',
  'system-announcement',
  'compliance-reminder',
  'other',
] as const;
export type HRNotificationTypeCode = (typeof HR_NOTIFICATION_TYPE_VALUES)[number];

export const HR_NOTIFICATION_PRIORITY_VALUES = ['low', 'medium', 'high', 'urgent'] as const;
export type HRNotificationPriorityCode = (typeof HR_NOTIFICATION_PRIORITY_VALUES)[number];

export interface HRNotificationDTO {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  message: string;
  type: HRNotificationTypeCode;
  priority: HRNotificationPriorityCode;
  isRead: boolean;
  readAt?: Date | string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  scheduledFor?: Date | string | null;
  expiresAt?: Date | string | null;
  correlationId?: string | null;
  createdByUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface HRNotificationCreateDTO
  extends Omit<HRNotificationDTO, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'readAt'> {
  isRead?: boolean;
  readAt?: Date | string | null;
}

export interface HRNotificationListFilters {
  unreadOnly?: boolean;
  since?: Date | string;
  until?: Date | string;
  types?: HRNotificationTypeCode[];
  priorities?: HRNotificationPriorityCode[];
  includeExpired?: boolean;
  limit?: number;
}

