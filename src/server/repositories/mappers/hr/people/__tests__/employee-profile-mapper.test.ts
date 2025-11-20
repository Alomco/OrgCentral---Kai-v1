import { describe, it, expect } from 'vitest';
import { mapPrismaEmployeeProfileToDomain, mapDomainEmployeeProfileToPrisma, buildPrismaCreateFromDomain, buildPrismaUpdateFromDomain, buildPrismaWhereFromFilters } from '../employee-profile-mapper';
import type { EmployeeProfile } from '../../../../../types/hr-types';
import { Prisma, type $Enums } from '@prisma/client';

describe('employee-profile mapper', () => {
    it('maps domain profile to prisma payload for create', () => {
        const now = new Date();
        const domain: EmployeeProfile = {
            id: 'p1',
            orgId: 'org1',
            userId: 'u1',
            employeeNumber: 'EMP-001',
            jobTitle: 'Engineer',
            employmentType: 'FULL_TIME' as $Enums.EmploymentType,
            startDate: now,
            endDate: null,
            managerOrgId: null,
            managerUserId: null,
            annualSalary: 90000,
            hourlyRate: null,
            costCenter: null,
            location: undefined,
            niNumber: null,
            emergencyContact: undefined,
            nextOfKin: undefined,
            healthStatus: 'UNDEFINED' as $Enums.HealthStatus,
            workPermit: undefined,
            bankDetails: undefined,
            metadata: undefined,
            createdAt: now,
            updatedAt: now,
        };

        const createDto = buildPrismaCreateFromDomain({ ...domain, orgId: domain.orgId });

        expect(createDto).toBeDefined();
        expect(createDto.orgId).toEqual(domain.orgId);
        expect(createDto.employeeNumber).toEqual(domain.employeeNumber);
        expect(createDto.employmentType).toEqual('FULL_TIME');
    });

    it('builds update payload with only provided fields', () => {
        const updates: Partial<EmployeeProfile> = { jobTitle: 'Senior Dev', hourlyRate: 60 };
        const updateDto = buildPrismaUpdateFromDomain(updates);
        expect(updateDto.jobTitle).toEqual('Senior Dev');
        expect(updateDto.hourlyRate).toEqual(60);
    });

    it('maps prisma record to domain', () => {
        const record: Prisma.EmployeeProfileUncheckedCreateInput & { id: string; createdAt: Date; updatedAt: Date } = {
            id: 'p1',
            orgId: 'org1',
            userId: 'u1',
            employeeNumber: 'EMP-001',
            employmentType: 'FULL_TIME',
            jobTitle: 'Dev',
            startDate: new Date('2023-01-01'),
            endDate: null,
            managerOrgId: null,
            managerUserId: null,
            annualSalary: 50000,
            hourlyRate: 35,
            costCenter: null,
            location: Prisma.JsonNull,
            niNumber: null,
            emergencyContact: Prisma.JsonNull,
            nextOfKin: Prisma.JsonNull,
            healthStatus: 'UNDEFINED',
            workPermit: Prisma.JsonNull,
            bankDetails: Prisma.JsonNull,
            metadata: Prisma.JsonNull,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const domain = mapPrismaEmployeeProfileToDomain(record as any);
        expect(domain.employeeNumber).toEqual('EMP-001');
        expect(domain.hourlyRate).toEqual(35);
    });

    it('builds where filter from filters', () => {
        const where = buildPrismaWhereFromFilters({ orgId: 'org1', jobTitle: 'Leader', startDate: new Date('2024-01-01') });
        expect(where.orgId).toEqual('org1');
        expect((where.jobTitle as any).contains).toEqual('Leader');
        expect((where.startDate as any).gte).toBeTruthy();
    });
});
