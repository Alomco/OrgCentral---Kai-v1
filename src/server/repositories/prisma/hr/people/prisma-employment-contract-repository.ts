import { Prisma, type EmploymentContract as PrismaEmploymentContract, type ContractType } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import { mapPrismaEmploymentContractToDomain } from '@/server/repositories/mappers/hr/people/employment-contract-mapper';
import type { EmploymentContract } from '@/server/types/hr-types';
import type { EmploymentContractFilters, EmploymentContractCreationData, EmploymentContractUpdateData } from './prisma-employment-contract-repository.types';

export class PrismaEmploymentContractRepository extends BasePrismaRepository implements IEmploymentContractRepository {
  // BasePrismaRepository enforced DI

  private static toJsonInput(value?: Prisma.JsonValue | null): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === null) { return Prisma.JsonNull; }
    if (value === undefined) { return undefined; }
    return value as Prisma.InputJsonValue;
  }

  async findById(id: string): Promise<PrismaEmploymentContract | null> {
    return this.prisma.employmentContract.findUnique({
      where: { id },
    });
  }

  private static serializeLocation(loc?: EmploymentContract['location'] | string): string | undefined {
    if (!loc) { return undefined; }
    if (typeof loc === 'string') { return loc; }
    return JSON.stringify(loc);
  }

  async findByUserId(orgId: string, userId: string, activeOnly = true): Promise<PrismaEmploymentContract[]> {
    const whereClause: Prisma.EmploymentContractWhereInput = {
      orgId,
      userId,
    };

    if (activeOnly) {
      whereClause.archivedAt = null;
    }

    return this.prisma.employmentContract.findMany({ where: whereClause, orderBy: { startDate: 'desc' } });
  }

  async findAll(filters?: EmploymentContractFilters): Promise<PrismaEmploymentContract[]> {
    const whereClause: Prisma.EmploymentContractWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters?.contractType) {
      whereClause.contractType = filters.contractType;
    }

    if (filters?.departmentId) {
      whereClause.departmentId = filters.departmentId;
    }

    if (filters?.active !== undefined) {
      if (filters.active) {
        whereClause.archivedAt = null;
      } else {
        whereClause.NOT = { archivedAt: null };
      }
    }

    return this.prisma.employmentContract.findMany({ where: whereClause, orderBy: { startDate: 'desc' } });
  }

  async create(data: EmploymentContractCreationData): Promise<PrismaEmploymentContract> {
    return this.prisma.employmentContract.create({ data });
  }

  async update(id: string, data: EmploymentContractUpdateData): Promise<PrismaEmploymentContract> {
    return this.prisma.employmentContract.update({ where: { id }, data });
  }

  async archive(id: string): Promise<PrismaEmploymentContract> {
    return this.prisma.employmentContract.update({
      where: { id },
      data: {
        archivedAt: new Date()
      },
    });
  }

  async delete(id: string): Promise<PrismaEmploymentContract> {
    return this.prisma.employmentContract.delete({
      where: { id },
    });
  }

  // Contract wrappers
  async createEmploymentContract(tenantId: string, contract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const createData: EmploymentContractCreationData = {
      orgId: tenantId,
      userId: contract.userId,
      contractType: contract.contractType as ContractType,
      startDate: contract.startDate,
      endDate: contract.endDate ?? undefined,
      jobTitle: contract.jobTitle,
      departmentId: contract.departmentId ?? undefined,
      location: PrismaEmploymentContractRepository.serializeLocation(contract.location),
      probationEndDate: contract.probationEndDate ?? undefined,
      furloughStartDate: contract.furloughStartDate ?? undefined,
      furloughEndDate: contract.furloughEndDate ?? undefined,
      workingPattern: PrismaEmploymentContractRepository.toJsonInput(contract.workingPattern as Prisma.JsonValue | null | undefined),
      benefits: PrismaEmploymentContractRepository.toJsonInput(contract.benefits as Prisma.JsonValue | null | undefined),
      terminationReason: contract.terminationReason ?? undefined,
      terminationNotes: contract.terminationNotes ?? undefined,
    };
    await this.create(createData);
  }

  async updateEmploymentContract(tenantId: string, contractId: string, updates: Partial<Omit<EmploymentContract, 'id' | 'orgId' | 'employeeId' | 'userId' | 'createdAt'>>): Promise<void> {
    const existing = await this.findById(contractId);
    if (existing?.orgId !== tenantId) { throw new Error('Contract not found'); }
    const updateData: EmploymentContractUpdateData = {};
    if (updates.endDate !== undefined) { updateData.endDate = updates.endDate ?? undefined; }
    if (updates.jobTitle !== undefined) { updateData.jobTitle = updates.jobTitle; }
    if (updates.departmentId !== undefined) { updateData.departmentId = updates.departmentId ?? undefined; }
    if (updates.location !== undefined) { updateData.location = PrismaEmploymentContractRepository.serializeLocation(updates.location as EmploymentContract['location'] | string); }
    if (updates.probationEndDate !== undefined) { updateData.probationEndDate = updates.probationEndDate ?? undefined; }
    if (updates.furloughStartDate !== undefined) { updateData.furloughStartDate = updates.furloughStartDate ?? undefined; }
    if (updates.furloughEndDate !== undefined) { updateData.furloughEndDate = updates.furloughEndDate ?? undefined; }
    if (updates.workingPattern !== undefined) { updateData.workingPattern = PrismaEmploymentContractRepository.toJsonInput(updates.workingPattern as Prisma.JsonValue | null | undefined); }
    if (updates.benefits !== undefined) { updateData.benefits = PrismaEmploymentContractRepository.toJsonInput(updates.benefits as Prisma.JsonValue | null | undefined); }
    if (updates.terminationReason !== undefined) { updateData.terminationReason = updates.terminationReason; }
    if (updates.terminationNotes !== undefined) { updateData.terminationNotes = updates.terminationNotes; }
    if (updates.archivedAt !== undefined) { updateData.archivedAt = updates.archivedAt ?? undefined; }
    await this.update(contractId, updateData);
  }

  async getEmploymentContract(tenantId: string, contractId: string): Promise<EmploymentContract | null> {
    const rec = await this.findById(contractId);
    if (rec?.orgId !== tenantId) { return null; }
    return mapPrismaEmploymentContractToDomain(rec);
  }

  async getEmploymentContractByEmployee(tenantId: string, employeeId: string): Promise<EmploymentContract | null> {
    const rec = await this.prisma.employmentContract.findFirst({ where: { orgId: tenantId, userId: employeeId } });
    if (!rec) { return null; }
    return mapPrismaEmploymentContractToDomain(rec);
  }

  async getEmploymentContractsByOrganization(tenantId: string, filters?: { status?: string; contractType?: ContractType; departmentId?: string; startDate?: Date; endDate?: Date; }): Promise<EmploymentContract[]> {
    const recs = await this.findAll({ orgId: tenantId, contractType: filters?.contractType, departmentId: filters?.departmentId });
    return recs.map((r) => mapPrismaEmploymentContractToDomain(r));
  }

  async deleteEmploymentContract(tenantId: string, contractId: string): Promise<void> {
    const existing = await this.findById(contractId);
    if (existing?.orgId !== tenantId) { throw new Error('Contract not found'); }
    await this.delete(contractId);
  }
}
