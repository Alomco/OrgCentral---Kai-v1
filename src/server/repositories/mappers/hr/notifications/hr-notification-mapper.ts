import type { Prisma, HRNotification as PrismaHRNotification, $Enums } from '@prisma/client';
import type { HRNotificationCreateDTO, HRNotificationDTO } from '@/server/types/hr/notifications';

const toDomainType = (type: $Enums.HRNotificationType): HRNotificationDTO['type'] => type;
const toPrismaType = (type: HRNotificationDTO['type']): $Enums.HRNotificationType =>
  type as $Enums.HRNotificationType;

const toDomainPriority = (priority: $Enums.NotificationPriority): HRNotificationDTO['priority'] =>
  priority;
const toPrismaPriority = (priority: HRNotificationDTO['priority']): $Enums.NotificationPriority =>
  priority as $Enums.NotificationPriority;

export function mapPrismaHRNotificationToDomain(record: PrismaHRNotification): HRNotificationDTO {
  const metadata = record.metadata as Prisma.JsonValue | null | undefined;
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    title: record.title,
    message: record.message,
    type: toDomainType(record.type),
    priority: toDomainPriority(record.priority),
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
  const type: $Enums.HRNotificationType = toPrismaType(input.type);
  const priority: $Enums.NotificationPriority = toPrismaPriority(input.priority);
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
