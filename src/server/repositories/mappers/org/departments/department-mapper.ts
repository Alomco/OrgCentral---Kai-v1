import type { Department } from '@/server/types/hr-types';
import type { Department as PrismaDepartment } from '@prisma/client';

export function mapPrismaDepartmentToDomain(record: PrismaDepartment): Department {
    return {
        id: record.id,
        orgId: record.orgId,
        name: record.name,
        path: record.path ?? null,
        leaderOrgId: record.leaderOrgId ?? null,
        leaderUserId: record.leaderUserId ?? null,
        businessUnit: record.businessUnit ?? null,
        costCenter: record.costCenter ?? null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainDepartmentToPrisma(input: Department): PrismaDepartment {
    return {
        id: input.id,
        orgId: input.orgId,
        name: input.name,
        path: input.path ?? null,
        leaderOrgId: input.leaderOrgId ?? null,
        leaderUserId: input.leaderUserId ?? null,
        businessUnit: input.businessUnit ?? null,
        costCenter: input.costCenter ?? null,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}
