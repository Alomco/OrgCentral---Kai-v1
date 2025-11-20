import type { Prisma, LeavePolicy as PrismaLeavePolicy, LeavePolicyType as PrismaLeavePolicyType, LeaveAccrualFrequency as PrismaLeaveAccrualFrequency } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { LeavePolicy } from '@/server/types/leave-types';
import type { LeavePolicyFilters, LeavePolicyCreationData, LeavePolicyUpdateData } from './prisma-leave-policy-repository.types';
import { mapCreateToPrisma, buildPrismaLeavePolicyUpdate, mapPrismaToDomain } from '@/server/repositories/mappers/hr/leave';

export class PrismaLeavePolicyRepository extends BasePrismaRepository implements ILeavePolicyRepository {
  // BasePrismaRepository enforces DI

  async findById(id: string): Promise<PrismaLeavePolicy | null> {
    return this.prisma.leavePolicy.findUnique({
      where: { id },
    });
  }

  async findByName(orgId: string, name: string): Promise<PrismaLeavePolicy | null> {
    return this.prisma.leavePolicy.findUnique({
      where: {
        orgId_name: {
          orgId,
          name
        }
      }
    });
  }

  async findDefault(orgId: string): Promise<PrismaLeavePolicy | null> {
    return this.prisma.leavePolicy.findFirst({
      where: {
        orgId,
        isDefault: true
      }
    });
  }

  async findAll(filters?: LeavePolicyFilters): Promise<PrismaLeavePolicy[]> {
    const whereClause: Prisma.LeavePolicyWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.departmentId) {
      whereClause.departmentId = filters.departmentId;
    }

    if (filters?.policyType) {
      whereClause.policyType = filters.policyType;
    }

    if (filters?.isDefault !== undefined) {
      whereClause.isDefault = filters.isDefault;
    }

    if (filters?.active !== undefined) {
      if (filters.active) {
        whereClause.activeTo = { gte: new Date() };
        whereClause.activeFrom = { lte: new Date() };
      } else {
        whereClause.activeTo = { lt: new Date() };
      }
    }

    return this.prisma.leavePolicy.findMany({ where: whereClause, orderBy: { name: 'asc' } });
  }

  async create(data: LeavePolicyCreationData): Promise<PrismaLeavePolicy> {
    const createPayload = mapCreateToPrisma(data);
    return this.prisma.leavePolicy.create({ data: createPayload });
  }

  async update(id: string, data: LeavePolicyUpdateData): Promise<PrismaLeavePolicy> {
    const updatePayload = buildPrismaLeavePolicyUpdate(data);
    return this.prisma.leavePolicy.update({ where: { id }, data: updatePayload });
  }

  async delete(id: string): Promise<PrismaLeavePolicy> {
    return this.prisma.leavePolicy.delete({ where: { id } });
  }

  // Moved buildPrismaLeavePolicyUpdate to mapper to reduce repository LOC

  private assertPolicyOwnership(existing: PrismaLeavePolicy | null, tenantId: string): void {
    if (existing?.orgId !== tenantId) {
      throw new Error('Leave policy not found');
    }
  }

  // --- Contract wrapper methods ---
  async createLeavePolicy(tenantId: string, policy: Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const dataToCreate: LeavePolicyCreationData = {
      orgId: tenantId,
      departmentId: policy.departmentId ?? undefined,
      name: policy.name,
      policyType: policy.policyType as PrismaLeavePolicyType,
      accrualFrequency: policy.accrualFrequency as PrismaLeaveAccrualFrequency,
      accrualAmount: policy.accrualAmount ?? undefined,
      carryOverLimit: policy.carryOverLimit ?? undefined,
      requiresApproval: policy.requiresApproval,
      isDefault: policy.isDefault,
      activeFrom: typeof policy.activeFrom === 'string' ? new Date(policy.activeFrom) : (policy.activeFrom as Date),
      activeTo:
        policy.activeTo ? (typeof policy.activeTo === 'string' ? new Date(policy.activeTo) : (policy.activeTo as Date)) : undefined,
      statutoryCompliance: policy.statutoryCompliance ?? false,
      maxConsecutiveDays: policy.maxConsecutiveDays ?? undefined,
      allowNegativeBalance: policy.allowNegativeBalance ?? false,
      metadata: policy.metadata ?? undefined,
    };
    await this.create(dataToCreate);
  }

  async updateLeavePolicy(tenantId: string, policyId: string, updates: Partial<Omit<LeavePolicy, 'id' | 'orgId' | 'createdAt'>>): Promise<void> {
    const existing = await this.findById(policyId);
    this.assertPolicyOwnership(existing, tenantId);
    const normalized: Partial<LeavePolicyUpdateData> = {};
    if (Object.prototype.hasOwnProperty.call(updates, 'departmentId')) {
      normalized.departmentId = updates.departmentId as string | null;
    }
    if (updates.accrualFrequency !== undefined) {
      normalized.accrualFrequency = updates.accrualFrequency as PrismaLeaveAccrualFrequency;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'accrualAmount')) {
      normalized.accrualAmount = updates.accrualAmount as number | null;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'carryOverLimit')) {
      normalized.carryOverLimit = updates.carryOverLimit as number | null;
    }
    if (updates.requiresApproval !== undefined) {
      normalized.requiresApproval = updates.requiresApproval;
    }
    if (updates.isDefault !== undefined) {
      normalized.isDefault = updates.isDefault;
    }
    if (updates.activeFrom !== undefined) {
      normalized.activeFrom = typeof updates.activeFrom === 'string' ? new Date(updates.activeFrom as unknown as string) : (updates.activeFrom as Date);
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'activeTo')) {
      const at = updates.activeTo;
      if (at === undefined) {
        normalized.activeTo = undefined;
      } else if (at === null) {
        normalized.activeTo = null;
      } else if (typeof at === 'string') {
        normalized.activeTo = new Date(at);
      } else {
        normalized.activeTo = at as Date;
      }
    }
    if (updates.statutoryCompliance !== undefined) {
      normalized.statutoryCompliance = updates.statutoryCompliance;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'maxConsecutiveDays')) {
      normalized.maxConsecutiveDays = updates.maxConsecutiveDays as number | null;
    }
    if (updates.allowNegativeBalance !== undefined) {
      normalized.allowNegativeBalance = updates.allowNegativeBalance;
    }
    if (updates.metadata !== undefined) {
      normalized.metadata = updates.metadata;
    }
    const prismaUpdate = buildPrismaLeavePolicyUpdate(normalized);
    if (Object.keys(prismaUpdate).length > 0) {
      await this.prisma.leavePolicy.update({ where: { id: policyId }, data: prismaUpdate });
    }
  }

  async getLeavePolicy(tenantId: string, policyId: string): Promise<LeavePolicy | null> {
    const rec = await this.findById(policyId);
    if (rec?.orgId !== tenantId) { return null; }
    return mapPrismaToDomain(rec);
  }

  async getLeavePoliciesByOrganization(tenantId: string): Promise<LeavePolicy[]> {
    const recs = await this.findAll({ orgId: tenantId });
    return recs.map(mapPrismaToDomain);
  }

  async deleteLeavePolicy(tenantId: string, policyId: string): Promise<void> {
    const rec = await this.findById(policyId);
    if (rec?.orgId !== tenantId) { throw new Error('Leave policy not found'); }
    await this.delete(policyId);
  }
}