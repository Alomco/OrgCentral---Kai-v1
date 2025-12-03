import type { Prisma, HRNotification as PrismaHRNotification, $Enums } from '@prisma/client';
import type { HRNotificationCreateDTO, HRNotificationDTO } from '@/server/types/hr/notifications';

function mapPrismaTypeToDomain(type: $Enums.HRNotificationType): HRNotificationDTO['type'] {
  switch (type) {
    case 'LEAVE_APPROVAL':
      return 'leave-approval';
    case 'LEAVE_REJECTION':
      return 'leave-rejection';
    case 'DOCUMENT_EXPIRY':
      return 'document-expiry';
    case 'POLICY_UPDATE':
      return 'policy-update';
    case 'PERFORMANCE_REVIEW':
      return 'performance-review';
    case 'SYSTEM_ANNOUNCEMENT':
      return 'system-announcement';
    case 'COMPLIANCE_REMINDER':
      return 'compliance-reminder';
    case 'OTHER':
    default:
      return 'other';
  }
}

function mapDomainTypeToPrisma(type: HRNotificationDTO['type']): $Enums.HRNotificationType {
  switch (type) {
    case 'leave-approval':
      return 'LEAVE_APPROVAL';
    case 'leave-rejection':
      return 'LEAVE_REJECTION';
    case 'document-expiry':
      return 'DOCUMENT_EXPIRY';
    case 'policy-update':
      return 'POLICY_UPDATE';
    case 'performance-review':
      return 'PERFORMANCE_REVIEW';
    case 'system-announcement':
      return 'SYSTEM_ANNOUNCEMENT';
    case 'compliance-reminder':
      return 'COMPLIANCE_REMINDER';
    case 'other':
    default:
      return 'OTHER';
  }
}

function mapPrismaPriorityToDomain(priority: $Enums.NotificationPriority): HRNotificationDTO['priority'] {
  switch (priority) {
    case 'LOW':
      return 'low';
    case 'MEDIUM':
      return 'medium';
    case 'HIGH':
      return 'high';
    case 'URGENT':
    default:
      return 'urgent';
  }
}

function mapDomainPriorityToPrisma(priority: HRNotificationDTO['priority']): $Enums.NotificationPriority {
  switch (priority) {
    case 'low':
      return 'LOW';
    case 'medium':
      return 'MEDIUM';
    case 'high':
      return 'HIGH';
    case 'urgent':
    default:
      return 'URGENT';
  }
}

export function mapPrismaHRNotificationToDomain(record: PrismaHRNotification): HRNotificationDTO {
  const metadata = record.metadata as Prisma.JsonValue | null | undefined;
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    title: record.title,
    message: record.message,
    type: mapPrismaTypeToDomain(record.type),
    priority: mapPrismaPriorityToDomain(record.priority),
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
    metadata: metadata ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainHRNotificationToPrismaCreate(
  input: HRNotificationCreateDTO,
): Prisma.HRNotificationUncheckedCreateInput {
  const type: $Enums.HRNotificationType = mapDomainTypeToPrisma(input.type);
  const priority: $Enums.NotificationPriority = mapDomainPriorityToPrisma(input.priority);
  const metadata = input.metadata as Prisma.InputJsonValue | null | undefined;
  return {
    orgId: input.orgId,
    userId: input.userId,
    title: input.title,
    message: input.message,
    type,
    priority,
    isRead: input.isRead ?? false,
    readAt: input.readAt ?? null,
    actionUrl: input.actionUrl ?? null,
    actionLabel: input.actionLabel ?? null,
    scheduledFor: input.scheduledFor ?? null,
    expiresAt: input.expiresAt ?? null,
    correlationId: input.correlationId ?? null,
    createdByUserId: input.createdByUserId ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: metadata ?? undefined,
  };
}
