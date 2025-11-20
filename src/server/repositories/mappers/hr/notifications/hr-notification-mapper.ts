import type { HRNotification as PrismaHRNotification } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { HRNotification } from '@/server/types/hr-ops-types';

export function mapPrismaHRNotificationToDomain(record: PrismaHRNotification): HRNotification {
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
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata as Prisma.JsonValue | undefined,
    createdAt: record.createdAt,
  };
}

export function mapDomainHRNotificationToPrismaCreate(
  input: Omit<HRNotification, 'id' | 'createdAt'>,
): Prisma.HRNotificationUncheckedCreateInput {
  return {
    orgId: input.orgId,
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    priority: input.priority,
    isRead: input.isRead,
    readAt: input.readAt ?? null,
    actionUrl: input.actionUrl ?? null,
    actionLabel: input.actionLabel ?? null,
    scheduledFor: input.scheduledFor ?? null,
    expiresAt: input.expiresAt ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: input.metadata ?? undefined,
  };
}
