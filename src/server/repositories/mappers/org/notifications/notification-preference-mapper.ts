import type { NotificationPreference } from '@/server/types/hr-types';
import { Prisma, type NotificationPreference as PrismaNotificationPreference } from '@prisma/client';

export function mapPrismaNotificationPreferenceToDomain(record: PrismaNotificationPreference): NotificationPreference {
    return {
        id: record.id,
        orgId: record.orgId,
        userId: record.userId,
        channel: record.channel,
        enabled: record.enabled,
        quietHours: record.quietHours,
        metadata: record.metadata,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainNotificationPreferenceToPrisma(input: NotificationPreference): Prisma.NotificationPreferenceUncheckedCreateInput {
    return {
        orgId: input.orgId,
        userId: input.userId,
        channel: input.channel,
        enabled: input.enabled,
        quietHours: input.quietHours === null ? Prisma.JsonNull : (input.quietHours),
        metadata: input.metadata === null ? Prisma.JsonNull : (input.metadata),
        updatedAt: input.updatedAt,
    };
}
