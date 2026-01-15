import type { HRNotificationCreateDTO, HRNotificationDTO } from '@/server/types/hr/notifications';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type { HRNotificationType, NotificationPriority, PrismaInputJsonValue } from '@/server/types/prisma';

interface HRNotificationRecord {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  message: string;
  type: HRNotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  scheduledFor?: Date | null;
  expiresAt?: Date | null;
  correlationId?: string | null;
  createdByUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaInputJsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

interface HRNotificationCreatePayload {
  orgId: string;
  userId: string;
  title: string;
  message: string;
  type: HRNotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  scheduledFor?: Date | null;
  expiresAt?: Date | null;
  correlationId?: string | null;
  createdByUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaInputJsonValue;
}

export function mapPrismaHRNotificationToDomain(record: HRNotificationRecord): HRNotificationDTO {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    title: record.title,
    message: record.message,
    type: record.type,
    priority: record.priority,
    isRead: record.isRead,
    readAt: record.readAt ?? undefined,
    actionUrl: record.actionUrl ?? undefined,
    actionLabel: record.actionLabel ?? undefined,
    scheduledFor: record.scheduledFor ?? undefined,
    expiresAt: record.expiresAt ?? undefined,
    correlationId: record.correlationId ?? undefined,
    createdByUserId: record.createdByUserId ?? undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainHRNotificationToPrismaCreate(
  input: HRNotificationCreateDTO,
): HRNotificationCreatePayload {
  return {
    orgId: input.orgId,
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    priority: input.priority,
    isRead: input.isRead ?? false,
    readAt: toNullableDate(input.readAt) ?? null,
    actionUrl: input.actionUrl ?? null,
    actionLabel: input.actionLabel ?? null,
    scheduledFor: toNullableDate(input.scheduledFor) ?? null,
    expiresAt: toNullableDate(input.expiresAt) ?? null,
    correlationId: input.correlationId ?? null,
    createdByUserId: input.createdByUserId ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: input.metadata ? (input.metadata as PrismaInputJsonValue) : undefined,
  } satisfies HRNotificationCreatePayload;
}

function toNullableDate(value: Date | string | null | undefined): Date | null | undefined {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return undefined;
  }
  return value instanceof Date ? value : new Date(value);
}
