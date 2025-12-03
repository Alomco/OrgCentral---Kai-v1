import type { Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import { mapDomainHRPolicyToPrismaCreate, mapDomainHRPolicyToPrismaUpdate, mapPrismaHRPolicyToDomain } from '@/server/repositories/mappers/hr/policies/hr-policy-mapper';
import type { HRPolicy } from '@/server/types/hr-ops-types';
import { AuthorizationError } from '@/server/errors';

export class PrismaHRPolicyRepository extends BasePrismaRepository implements IHRPolicyRepository {
  async createPolicy(
    orgId: string,
    input: Omit<HRPolicy, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: HRPolicy['status'] },
  ): Promise<HRPolicy> {
    const data = mapDomainHRPolicyToPrismaCreate({ ...input, status: input.status ?? 'draft' });
    const rec = await this.prisma.hRPolicy.create({ data });
    if (rec.orgId !== orgId) {
      throw new AuthorizationError('Cross-tenant policy creation mismatch', { orgId });
    }
    return mapPrismaHRPolicyToDomain(rec);
  }

  async updatePolicy(
    orgId: string,
    policyId: string,
    updates: Partial<Pick<HRPolicy, 'title' | 'content' | 'category' | 'version' | 'effectiveDate' | 'expiryDate' | 'applicableRoles' | 'applicableDepartments' | 'requiresAcknowledgment' | 'status' | 'dataClassification' | 'residencyTag' | 'metadata'>>,
  ): Promise<HRPolicy> {
    const data = mapDomainHRPolicyToPrismaUpdate(updates);
    const rec = await this.prisma.hRPolicy.update({ where: { id: policyId }, data });
    if (rec.orgId !== orgId) {
      throw new AuthorizationError('Cross-tenant policy update mismatch', { orgId });
    }
    return mapPrismaHRPolicyToDomain(rec);
  }

  async getPolicy(orgId: string, policyId: string): Promise<HRPolicy | null> {
    const rec = await this.prisma.hRPolicy.findFirst({ where: { id: policyId, orgId } });
    return rec ? mapPrismaHRPolicyToDomain(rec) : null;
  }

  async listPolicies(orgId: string, filters?: { status?: string; category?: HRPolicy['category'] }): Promise<HRPolicy[]> {
    const where: Prisma.HRPolicyWhereInput = { orgId };
    if (filters?.status) { where.status = filters.status; }
    if (filters?.category) { where.category = filters.category; }
    const recs = await this.prisma.hRPolicy.findMany({ where, orderBy: { effectiveDate: 'desc' } });
    return recs.map(mapPrismaHRPolicyToDomain);
  }
}
