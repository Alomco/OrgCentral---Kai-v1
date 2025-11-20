import type { User } from '@/server/types/hr-types';
import type { Prisma, User as PrismaUser } from '@prisma/client';

export function mapPrismaUserToDomain(record: PrismaUser): User {
    return {
        id: record.id,
        email: record.email,
        displayName: record.displayName ?? null,
        status: record.status,
        authProvider: record.authProvider,
        lastLoginAt: record.lastLoginAt ?? null,
        failedLoginCount: record.failedLoginCount,
        lockedUntil: record.lockedUntil ?? null,
        lastPasswordChange: record.lastPasswordChange,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainUserToPrisma(input: User): Prisma.UserUncheckedCreateInput {
    return {
        email: input.email,
        displayName: input.displayName ?? null,
        status: input.status,
        authProvider: input.authProvider,
        lastLoginAt: input.lastLoginAt ?? null,
        failedLoginCount: input.failedLoginCount,
        lockedUntil: input.lockedUntil ?? null,
        lastPasswordChange: input.lastPasswordChange,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}
