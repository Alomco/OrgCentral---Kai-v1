import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import { mapDomainPolicyAckToPrismaCreate, mapPrismaPolicyAckToDomain } from '@/server/repositories/mappers/hr/policies/hr-policy-mapper';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

export class PrismaPolicyAcknowledgmentRepository extends BasePrismaRepository implements IPolicyAcknowledgmentRepository {
  async acknowledgePolicy(orgId: string, input: Omit<PolicyAcknowledgment, 'id'>): Promise<PolicyAcknowledgment> {
    const data = mapDomainPolicyAckToPrismaCreate({ ...input, orgId });
    const rec = await this.prisma.policyAcknowledgment.create({ data });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant policy acknowledgment mismatch');
    }
    return mapPrismaPolicyAckToDomain(rec);
  }

  async getAcknowledgment(orgId: string, policyId: string, userId: string, version: string): Promise<PolicyAcknowledgment | null> {
    const rec = await this.prisma.policyAcknowledgment.findFirst({ where: { orgId, policyId, userId, version } });
    return rec ? mapPrismaPolicyAckToDomain(rec) : null;
  }

  async listAcknowledgments(orgId: string, policyId: string): Promise<PolicyAcknowledgment[]> {
    const recs = await this.prisma.policyAcknowledgment.findMany({ where: { orgId, policyId }, orderBy: { acknowledgedAt: 'desc' } });
    return recs.map(mapPrismaPolicyAckToDomain);
  }
}
