import type { NotificationPreference } from '@/server/types/hr-types';
import { Prisma, type NotificationPreference as PrismaNotificationPreference } from '@prisma/client';

export function mapPrismaNotificationPreferenceToDomain(record: PrismaNotificationPreference): NotificationPreference {
    return {
        id: record.id,
        orgId: record.orgId,
        userId: record.userId,
        channel: record.channel,
        enabled: record.enabled,
        quietHours: record.quietHours as Prisma.JsonValue | null,
        metadata: record.metadata as Prisma.JsonValue | null,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainNotificationPreferenceToPrisma(input: NotificationPreference): Prisma.NotificationPreferenceUncheckedCreateInput {
    return {
        orgId: input.orgId,
        userId: input.userId,
        channel: input.channel,
        enabled: input.enabled,
        quietHours: input.quietHours === null ? Prisma.JsonNull : (input.quietHours as Prisma.InputJsonValue | undefined),
        metadata: input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue | undefined),
        updatedAt: input.updatedAt ?? undefined,
    };
}
