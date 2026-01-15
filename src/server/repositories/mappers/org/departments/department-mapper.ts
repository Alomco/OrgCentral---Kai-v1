import type { Department, DepartmentRecord } from '@/server/types/hr-types';

export function mapPrismaDepartmentToDomain(record: DepartmentRecord): Department {
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

export function mapDomainDepartmentToPrisma(input: Department): DepartmentRecord {
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
