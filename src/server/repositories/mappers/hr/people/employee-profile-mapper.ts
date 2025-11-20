import type { EmployeeProfile } from '@/server/types/hr-types';
import { Prisma, type EmployeeProfile as PrismaEmployeeProfile, type $Enums } from '@prisma/client';

export type EmployeeProfileFilters = {
    orgId?: string;
    userId?: string;
    jobTitle?: string;
    employmentType?: $Enums.EmploymentType;
    managerOrgId?: string;
    managerUserId?: string;
    startDate?: Date;
    endDate?: Date;
};

function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value === null || value === undefined) { return null; }
    if (typeof value === 'number') { return value; }
    try {
        return (value as Prisma.Decimal).toNumber();
    } catch {
        return null;
    }
}

export function mapPrismaEmployeeProfileToDomain(record: PrismaEmployeeProfile): EmployeeProfile {
    return {
        id: record.id,
        orgId: record.orgId,
        userId: record.userId,
        employeeNumber: record.employeeNumber,
        jobTitle: record.jobTitle ?? null,
        employmentType: record.employmentType,
        startDate: record.startDate ?? null,
        endDate: record.endDate ?? null,
        managerOrgId: record.managerOrgId ?? null,
        managerUserId: record.managerUserId ?? null,
        annualSalary: record.annualSalary ?? null,
        hourlyRate: decimalToNumber(record.hourlyRate),
        costCenter: record.costCenter ?? null,
        location: record.location as Prisma.JsonValue | null,
        niNumber: record.niNumber ?? null,
        emergencyContact: record.emergencyContact as Prisma.JsonValue | null,
        nextOfKin: record.nextOfKin as Prisma.JsonValue | null,
        healthStatus: record.healthStatus,
        workPermit: record.workPermit as Prisma.JsonValue | null,
        bankDetails: record.bankDetails as Prisma.JsonValue | null,
        metadata: record.metadata as Prisma.JsonValue | null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

function toJsonInput(value?: Prisma.JsonValue | null): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === null) { return Prisma.JsonNull; }
    if (value === undefined) { return undefined; }
    return value as Prisma.InputJsonValue;
}

export function mapDomainEmployeeProfileToPrisma(input: EmployeeProfile): Prisma.EmployeeProfileUncheckedCreateInput {
    return {
        orgId: input.orgId,
        userId: input.userId,
        employeeNumber: input.employeeNumber,
        jobTitle: input.jobTitle ?? null,
        employmentType: input.employmentType,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        managerOrgId: input.managerOrgId ?? null,
        managerUserId: input.managerUserId ?? null,
        annualSalary: input.annualSalary ?? null,
        hourlyRate: input.hourlyRate ?? null,
        costCenter: input.costCenter ?? null,
        location: toJsonInput(input.location),
        niNumber: input.niNumber ?? null,
        emergencyContact: toJsonInput(input.emergencyContact),
        nextOfKin: toJsonInput(input.nextOfKin),
        healthStatus: input.healthStatus,
        workPermit: toJsonInput(input.workPermit),
        bankDetails: toJsonInput(input.bankDetails),
        metadata: toJsonInput(input.metadata),
        createdAt: input.createdAt ?? undefined,
        updatedAt: input.updatedAt ?? undefined,
    };
}

export function buildPrismaCreateFromDomain(input: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>): Prisma.EmployeeProfileUncheckedCreateInput {
    return mapDomainEmployeeProfileToPrisma(input as EmployeeProfile);
}

export function buildPrismaUpdateFromDomain(updates: Partial<Omit<EmployeeProfile, 'id' | 'orgId' | 'userId' | 'createdAt' | 'employeeNumber'>>): Prisma.EmployeeProfileUncheckedUpdateInput {
    const out: Prisma.EmployeeProfileUncheckedUpdateInput = {};
    if (updates.jobTitle !== undefined) out.jobTitle = updates.jobTitle;
    if (updates.employmentType !== undefined) out.employmentType = updates.employmentType as $Enums.EmploymentType;
    if (updates.startDate !== undefined) out.startDate = updates.startDate ?? null;
    if (updates.endDate !== undefined) out.endDate = updates.endDate ?? null;
    if (updates.managerOrgId !== undefined) out.managerOrgId = updates.managerOrgId ?? null;
    if (updates.managerUserId !== undefined) out.managerUserId = updates.managerUserId ?? null;
    if (updates.annualSalary !== undefined) out.annualSalary = updates.annualSalary ?? null;
    if (updates.hourlyRate !== undefined) out.hourlyRate = updates.hourlyRate ?? null;
    if (updates.costCenter !== undefined) out.costCenter = updates.costCenter ?? null;
    if (updates.location !== undefined) out.location = toJsonInput(updates.location);
    if (updates.niNumber !== undefined) out.niNumber = updates.niNumber ?? null;
    if (updates.emergencyContact !== undefined) out.emergencyContact = toJsonInput(updates.emergencyContact);
    if (updates.nextOfKin !== undefined) out.nextOfKin = toJsonInput(updates.nextOfKin);
    if (updates.healthStatus !== undefined) out.healthStatus = updates.healthStatus as $Enums.HealthStatus;
    if (updates.workPermit !== undefined) out.workPermit = toJsonInput(updates.workPermit);
    if (updates.bankDetails !== undefined) out.bankDetails = toJsonInput(updates.bankDetails);
    if (updates.metadata !== undefined) out.metadata = toJsonInput(updates.metadata);
    return out;
}

export function buildPrismaWhereFromFilters(filters?: EmployeeProfileFilters): Prisma.EmployeeProfileWhereInput {
    const where: Prisma.EmployeeProfileWhereInput = {};
    if (!filters) return where;
    if (filters.orgId) where.orgId = filters.orgId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.jobTitle) {
        const jobTitleFilter: Prisma.StringFilter = { contains: filters.jobTitle, mode: 'insensitive' };
        where.jobTitle = jobTitleFilter;
    }
    if (filters.employmentType) where.employmentType = filters.employmentType;
    if (filters.managerOrgId && filters.managerUserId) {
        where.managerOrgId = filters.managerOrgId;
        where.managerUserId = filters.managerUserId;
    }
    if (filters.startDate) {
        where.startDate = { gte: filters.startDate };
    }
    if (filters.endDate) {
        where.endDate = { lte: filters.endDate };
    }
    return where;
}
