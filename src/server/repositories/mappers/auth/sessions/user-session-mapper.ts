import type { UserSession } from '@/server/types/hr-types';
import { Prisma, type UserSession as PrismaUserSession } from '@prisma/client';

export function mapPrismaUserSessionToDomain(record: PrismaUserSession): UserSession {
    return {
        id: record.id,
        userId: record.userId,
        sessionId: record.sessionId,
        status: record.status,
        ipAddress: record.ipAddress ?? null,
        userAgent: record.userAgent ?? null,
        startedAt: record.startedAt,
        expiresAt: record.expiresAt,
        lastAccess: record.lastAccess,
        revokedAt: record.revokedAt ?? null,
        metadata: record.metadata as Prisma.JsonValue | null,
    };
}

export function mapDomainUserSessionToPrisma(input: UserSession): Prisma.UserSessionUncheckedCreateInput {
    return {
        userId: input.userId,
        sessionId: input.sessionId,
        status: input.status,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        startedAt: input.startedAt,
        expiresAt: input.expiresAt,
        lastAccess: input.lastAccess,
        revokedAt: input.revokedAt ?? null,
        metadata: input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue | undefined),
    };
}
