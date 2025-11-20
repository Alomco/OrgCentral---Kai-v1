/**
 * Mappers for Role entities
 * Converts between domain models and Prisma/client models
 */
import type { Role } from '@/server/types/hr-types';
import type { Role as PrismaRole } from '@prisma/client';

export function mapPrismaRoleToDomain(record: PrismaRole): Role {
    return {
        id: record.id,
        orgId: record.orgId,
        name: record.name,
        description: record.description ?? undefined,
        scope: record.scope,
        permissions: record.permissions,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainRoleToPrisma(input: Role): PrismaRole {
    return {
        id: input.id,
        orgId: input.orgId,
        name: input.name,
        description: input.description ?? null,
        scope: input.scope,
        permissions: input.permissions,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}
