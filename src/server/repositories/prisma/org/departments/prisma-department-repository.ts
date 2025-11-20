import type { Department as PrismaDepartment, Prisma } from '@prisma/client';
import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import type { IDepartmentRepository } from '@/server/repositories/contracts/org/departments/department-repository-contract';
import { mapPrismaDepartmentToDomain } from '@/server/repositories/mappers/org/departments/department-mapper';
import type { Department } from '@/server/types/hr-types';
import type {
    DepartmentFilters,
    DepartmentCreationData,
    DepartmentUpdateData,
} from './prisma-department-repository.types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export class PrismaDepartmentRepository extends OrgScopedPrismaRepository implements IDepartmentRepository {
  async findById(id: string): Promise<PrismaDepartment | null> {
    return getModelDelegate(this.prisma, 'department').findUnique({ where: { id } });
  }

  async findByName(orgId: string, name: string): Promise<PrismaDepartment | null> {
    return getModelDelegate(this.prisma, 'department').findUnique({ where: { orgId_name: { orgId, name } } });
  }

  async findAll(filters?: DepartmentFilters): Promise<PrismaDepartment[]> {
    const whereClause: Prisma.DepartmentWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.businessUnit) {
      whereClause.businessUnit = filters.businessUnit;
    }

    if (filters?.costCenter) {
      whereClause.costCenter = filters.costCenter;
    }

    return getModelDelegate(this.prisma, 'department').findMany({ where: whereClause, orderBy: { name: 'asc' } });
  }

  async create(data: DepartmentCreationData): Promise<PrismaDepartment> {
    return getModelDelegate(this.prisma, 'department').create({ data });
  }

  async update(id: string, data: DepartmentUpdateData): Promise<PrismaDepartment> {
    return getModelDelegate(this.prisma, 'department').update({ where: { id }, data });
  }

  async delete(id: string): Promise<PrismaDepartment> {
    return getModelDelegate(this.prisma, 'department').delete({ where: { id } });
  }

  // --- Contract-facing methods ---
  async getDepartment(context: RepositoryAuthorizationContext, departmentId: string): Promise<Department | null> {
    this.tagCache(context, 'departments');
    const rec = await this.findById(departmentId);
    if (!rec) { return null; }
    this.assertTenantRecord(rec, context);
    return mapPrismaDepartmentToDomain(rec);
  }

  async getDepartmentByCode(context: RepositoryAuthorizationContext, code: string): Promise<Department | null> {
    this.tagCache(context, 'departments');
    // Schema does not track department code; fall back to name match
    const rec = await getModelDelegate(this.prisma, 'department').findFirst({ where: { orgId: context.orgId, name: code } });
    return rec ? mapPrismaDepartmentToDomain(rec) : null;
  }

  async getDepartmentsByOrganization(context: RepositoryAuthorizationContext, filters?: { status?: string; parentId?: string; }): Promise<Department[]> {
    this.tagCache(context, 'departments');
    const records = await getModelDelegate(this.prisma, 'department').findMany({ where: { orgId: context.orgId }, orderBy: { name: 'asc' } });
    return records
      .map(mapPrismaDepartmentToDomain)
      .filter((d) => (filters?.parentId ? d.path === filters.parentId : true));
  }

  async createDepartment(context: RepositoryAuthorizationContext, department: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'headcount'>): Promise<void> {
    const createData: DepartmentCreationData = {
      orgId: context.orgId,
      name: department.name,
      path: department.path ?? undefined,
      leaderOrgId: department.leaderOrgId ?? undefined,
      leaderUserId: department.leaderUserId ?? undefined,
      businessUnit: department.businessUnit ?? undefined,
      costCenter: department.costCenter ?? undefined,
    };
    await this.create(createData);
    await this.invalidateCache(context, 'departments');
  }

  async updateDepartment(context: RepositoryAuthorizationContext, departmentId: string, updates: Partial<Omit<Department, 'id' | 'orgId' | 'createdAt' | 'headcount'>>): Promise<void> {
    const existing = await this.findById(departmentId);
    this.assertTenantRecord(existing, context);
    const updateData: DepartmentUpdateData = {} as DepartmentUpdateData;
    if (updates.name !== undefined) { updateData.name = updates.name; }
    if (typeof updates.path === 'string') { updateData.path = updates.path; }
    if (typeof updates.leaderOrgId === 'string') { updateData.leaderOrgId = updates.leaderOrgId; }
    if (typeof updates.leaderUserId === 'string') { updateData.leaderUserId = updates.leaderUserId; }
    if (typeof updates.businessUnit === 'string') { updateData.businessUnit = updates.businessUnit; }
    if (typeof updates.costCenter === 'string') { updateData.costCenter = updates.costCenter; }
    await this.update(departmentId, updateData);
    await this.invalidateCache(context, 'departments');
  }

  async deleteDepartment(context: RepositoryAuthorizationContext, departmentId: string): Promise<void> {
    const existing = await this.findById(departmentId);
    this.assertTenantRecord(existing, context);
    await this.delete(departmentId);
    await this.invalidateCache(context, 'departments');
  }
}
