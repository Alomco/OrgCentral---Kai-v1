import type { EmployeeProfile as PrismaEmployeeProfile, Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import { mapPrismaEmployeeProfileToDomain, buildPrismaCreateFromDomain, buildPrismaUpdateFromDomain, buildPrismaWhereFromFilters } from '@/server/repositories/mappers/hr/people/employee-profile-mapper';
import type { EmployeeProfile } from '@/server/types/hr-types';
import type { EmployeeProfileFilters } from '@/server/repositories/mappers/hr/people/employee-profile-mapper';

export class PrismaEmployeeProfileRepository extends BasePrismaRepository implements IEmployeeProfileRepository {
  // BasePrismaRepository enforces DI

  async findById(orgId: string, userId: string): Promise<PrismaEmployeeProfile | null> {
    return this.prisma.employeeProfile.findUnique({
      where: {
        orgId_userId: {
          orgId,
          userId
        }
      }
    });
  }

  async findByEmployeeNumber(employeeNumber: string): Promise<PrismaEmployeeProfile | null> {
    return this.prisma.employeeProfile.findUnique({ where: { employeeNumber } });
  }

  async findAll(filters?: EmployeeProfileFilters): Promise<PrismaEmployeeProfile[]> {
    // Inline the call to keep TypeScript inference and avoid unsafe assignment warnings
    return this.prisma.employeeProfile.findMany({ where: buildPrismaWhereFromFilters(filters), orderBy: { employeeNumber: 'asc' } });
  }

  async create(data: Prisma.EmployeeProfileUncheckedCreateInput): Promise<PrismaEmployeeProfile> {
    return this.prisma.employeeProfile.create({ data });
  }

  async update(orgId: string, userId: string, data: Prisma.EmployeeProfileUncheckedUpdateInput): Promise<PrismaEmployeeProfile> {
    return this.prisma.employeeProfile.update({ where: { orgId_userId: { orgId, userId } }, data });
  }

  async delete(orgId: string, userId: string): Promise<PrismaEmployeeProfile> {
    return this.prisma.employeeProfile.delete({ where: { orgId_userId: { orgId, userId } } });
  }

  // Contract wrappers
  async createEmployeeProfile(tenantId: string, profile: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const createData: Prisma.EmployeeProfileUncheckedCreateInput = buildPrismaCreateFromDomain({ ...profile, orgId: tenantId });
    await this.create(createData);
  }

  async updateEmployeeProfile(tenantId: string, profileId: string, updates: Partial<Omit<EmployeeProfile, 'id' | 'orgId' | 'userId' | 'createdAt' | 'employeeNumber'>>): Promise<void> {
    const existing = await this.getProfileByIdEnsuringTenant(profileId, tenantId);
    const updateData: Prisma.EmployeeProfileUncheckedUpdateInput = buildPrismaUpdateFromDomain(updates);
    await this.update(existing.orgId, existing.userId, updateData);
  }

  async getEmployeeProfile(tenantId: string, profileId: string): Promise<EmployeeProfile | null> {
    const rec = await this.getProfileByIdEnsuringTenant(profileId, tenantId).catch(() => null);
    if (!rec) { return null; }
    return mapPrismaEmployeeProfileToDomain(rec);
  }

  async getEmployeeProfileByUser(tenantId: string, userId: string): Promise<EmployeeProfile | null> {
    const rec = await this.findById(tenantId, userId);
    if (!rec) { return null; }
    return mapPrismaEmployeeProfileToDomain(rec);
  }

  async getEmployeeProfilesByOrganization(tenantId: string, filters?: { startDate?: Date; endDate?: Date; }): Promise<EmployeeProfile[]> {
    const recs = await this.findAll({ orgId: tenantId, startDate: filters?.startDate, endDate: filters?.endDate });
    return recs.map((r) => mapPrismaEmployeeProfileToDomain(r));
  }

  async deleteEmployeeProfile(tenantId: string, profileId: string): Promise<void> {
    const existing = await this.getProfileByIdEnsuringTenant(profileId, tenantId);
    await this.prisma.employeeProfile.delete({ where: { orgId_userId: { orgId: existing.orgId, userId: existing.userId } } });
  }

  private async getProfileByIdEnsuringTenant(profileId: string, tenantId: string) {
    const recs = await this.prisma.employeeProfile.findMany({ where: { orgId: tenantId } });
    const rec = recs.find((r) => (r as unknown as { id?: string }).id === profileId);
    if (!rec) { throw new Error('Profile not found'); }
    return rec;
  }
}
