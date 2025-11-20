import { Prisma, type LeavePolicyAccrual as PrismaLeavePolicyAccrual, type PrismaClient } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ILeavePolicyAccrualRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-accrual-repository-contract';
import type { LeavePolicyAccrual } from '@/server/types/leave-types';
import type { LeavePolicyAccrualFilters, LeavePolicyAccrualCreationData, LeavePolicyAccrualUpdateData } from './prisma-leave-policy-accrual-repository.types';

export class PrismaLeavePolicyAccrualRepository extends BasePrismaRepository implements ILeavePolicyAccrualRepository {
  // BasePrismaRepository enforces DI

  async findById(id: string): Promise<LeavePolicyAccrual | null> {
    const rec = await this.prisma.leavePolicyAccrual.findUnique({
      where: { id },
    });
    if (!rec) return null;
    return map(rec);
  }

  async findByPolicyAndTenure(policyId: string, tenureMonths: number): Promise<LeavePolicyAccrual | null> {
    const rec = await this.prisma.leavePolicyAccrual.findUnique({
      where: {
        policyId_tenureMonths: {
          policyId,
          tenureMonths
        }
      }
    });
    if (!rec) return null;
    return map(rec);
  }

  async findAll(filters?: LeavePolicyAccrualFilters): Promise<LeavePolicyAccrual[]> {
    const whereClause: Prisma.LeavePolicyAccrualWhereInput = {};

    if (filters?.policyId) {
      whereClause.policyId = filters.policyId;
    }

    if (filters?.tenureMonths !== undefined) {
      whereClause.tenureMonths = filters.tenureMonths;
    }

    const recs = await this.prisma.leavePolicyAccrual.findMany({
      where: whereClause,
      orderBy: { tenureMonths: 'asc' },
    });
    return recs.map(map);
  }

  async create(data: LeavePolicyAccrualCreationData): Promise<LeavePolicyAccrual> {
    const rec = await this.prisma.leavePolicyAccrual.create({
      data,
    });
    return map(rec);
  }

  async update(id: string, data: LeavePolicyAccrualUpdateData): Promise<LeavePolicyAccrual> {
    const rec = await this.prisma.leavePolicyAccrual.update({
      where: { id },
      data,
    });
    return map(rec);
  }

  async delete(id: string): Promise<LeavePolicyAccrual> {
    const rec = await this.prisma.leavePolicyAccrual.delete({
      where: { id },
    });
    return map(rec);
  }

  async deleteByPolicyAndTenure(policyId: string, tenureMonths: number): Promise<LeavePolicyAccrual> {
    const rec = await this.prisma.leavePolicyAccrual.delete({
      where: {
        policyId_tenureMonths: {
          policyId,
          tenureMonths
        }
      }
    });
    return map(rec);
  }

  // Contract wrappers
  async createLeavePolicyAccrual(tenantId: string, accrual: Omit<LeavePolicyAccrual, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.create({
      policyId: accrual.policyId,
      tenureMonths: accrual.tenureMonths,
      accrualPerPeriod: accrual.accrualPerPeriod,
      carryOverLimit: accrual.carryOverLimit ?? undefined,
    });
  }

  async updateLeavePolicyAccrual(tenantId: string, accrualId: string, updates: Partial<Omit<LeavePolicyAccrual, 'id' | 'orgId' | 'createdAt'>>): Promise<void> {
    const existing = await this.findById(accrualId);
    if (!existing) throw new Error('Accrual not found');
    const data: Prisma.LeavePolicyAccrualUpdateInput = {};
    if (updates.tenureMonths !== undefined) { data.tenureMonths = updates.tenureMonths; }
    if (updates.accrualPerPeriod !== undefined) { data.accrualPerPeriod = updates.accrualPerPeriod; }
    if (updates.carryOverLimit !== undefined) { data.carryOverLimit = updates.carryOverLimit ?? null; }
    await this.update(accrualId, data);
  }

  async getLeavePolicyAccrual(tenantId: string, accrualId: string): Promise<LeavePolicyAccrual | null> {
    const rec = await this.findById(accrualId);
    if (!rec) return null;
    return rec;
  }

  async getLeavePolicyAccrualsByEmployee(tenantId: string, employeeId: string): Promise<LeavePolicyAccrual[]> {
    const recs = await this.findAll({});
    return recs;
  }

  async getLeavePolicyAccrualsByOrganization(tenantId: string): Promise<LeavePolicyAccrual[]> {
    const recs = await this.findAll({});
    return recs;
  }

  async deleteLeavePolicyAccrual(tenantId: string, accrualId: string): Promise<void> {
    await this.delete(accrualId);
  }
}

function map(rec: PrismaLeavePolicyAccrual): LeavePolicyAccrual {
  return {
    id: rec.id,
    policyId: rec.policyId,
    tenureMonths: rec.tenureMonths,
    accrualPerPeriod: rec.accrualPerPeriod instanceof Prisma.Decimal ? rec.accrualPerPeriod.toNumber() : Number(rec.accrualPerPeriod),
    carryOverLimit: rec.carryOverLimit ?? null,
    createdAt: undefined,
    updatedAt: undefined,
  };
}
