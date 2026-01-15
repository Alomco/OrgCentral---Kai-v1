import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_DLP_POLICIES } from '@/server/repositories/cache-scopes';
import type { IDlpPolicyRepository } from '@/server/repositories/contracts/security/enhanced-security-repository-contracts';
import type { DlpPolicy } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type {
  DlpPolicyDelegate,
  DlpPolicyRecord,
  DlpRuleDelegate,
} from './prisma-dlp-policy-repository.types';

export class PrismaDlpPolicyRepository
  extends BasePrismaRepository
  implements IDlpPolicyRepository {
  private get policyDelegate(): DlpPolicyDelegate {
    const delegate = (this.prisma as { dlpPolicy?: DlpPolicyDelegate }).dlpPolicy;
    if (!delegate) {
      throw new Error('DLP policy delegate is not available on Prisma client.');
    }
    return delegate;
  }

  private get ruleDelegate(): DlpRuleDelegate {
    const delegate = (this.prisma as { dlpRule?: DlpRuleDelegate }).dlpRule;
    if (!delegate) {
      throw new Error('DLP rule delegate is not available on Prisma client.');
    }
    return delegate;
  }

  async createPolicy(
    context: RepositoryAuthorizationContext,
    policy: Omit<DlpPolicy, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DlpPolicy> {
    // Validate tenant isolation
    if (policy.orgId !== context.orgId) {
      throw new Error('Cannot create DLP policy for another organization');
    }

    // Ensure tenant-scoped caching
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_DLP_POLICIES,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.policyDelegate.create({
      data: {
        orgId: policy.orgId,
        name: policy.name,
        description: policy.description,
        enabled: policy.enabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create associated rules
    if (policy.rules.length > 0) {
      await this.ruleDelegate.createMany({
        data: policy.rules.map(rule => ({
          policyId: record.id,
          pattern: rule.pattern,
          dataType: rule.dataType,
          action: rule.action,
          severity: rule.severity,
          exceptions: rule.exceptions,
        })),
      });
    }

    // Fetch the policy with its rules
    const policyWithRules = await this.policyDelegate.findUnique({
      where: { id: record.id },
      include: { rules: true },
    });

    if (!policyWithRules) {
      throw new Error('Failed to create DLP policy');
    }

    await this.invalidateScope(context.orgId, context.dataClassification, context.dataResidency);
    return this.mapToDomain(policyWithRules);
  }

  async getPolicy(
    context: RepositoryAuthorizationContext,
    policyId: string
  ): Promise<DlpPolicy | null> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_DLP_POLICIES,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.policyDelegate.findUnique({
      where: { id: policyId },
      include: { rules: true },
    });

    if (!record) {
      return null;
    }

    // Enforce tenant isolation
    if (record.orgId !== context.orgId) {
      return null;
    }

    return this.mapToDomain(record);
  }

  async getPoliciesByOrg(
    context: RepositoryAuthorizationContext
  ): Promise<DlpPolicy[]> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_DLP_POLICIES,
      context.dataClassification,
      context.dataResidency,
    );

    const records = await this.policyDelegate.findMany({
      where: { orgId: context.orgId },
      include: { rules: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(record => this.mapToDomain(record));
  }

  async updatePolicy(
    context: RepositoryAuthorizationContext,
    policyId: string,
    updates: Partial<Omit<DlpPolicy, 'id' | 'orgId' | 'createdAt'>>
  ): Promise<void> {
    // First verify the policy belongs to the organization
    const existing = await this.policyDelegate.findUnique({ where: { id: policyId } });
    if (!existing || existing.orgId !== context.orgId) {
      throw new Error('DLP policy not found');
    }

    // Update the policy
    await this.policyDelegate.update({
      where: { id: policyId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    // If rules are being updated, handle separately
    if (updates.rules) {
      // Delete existing rules
      await this.ruleDelegate.deleteMany({ where: { policyId } });

      // Create new rules
      if (updates.rules.length > 0) {
        await this.ruleDelegate.createMany({
          data: updates.rules.map(rule => ({
            policyId,
            pattern: rule.pattern,
            dataType: rule.dataType,
            action: rule.action,
            severity: rule.severity,
            exceptions: rule.exceptions,
          })),
        });
      }
    }

    await this.invalidateScope(context.orgId, context.dataClassification, context.dataResidency);
  }

  async deletePolicy(
    context: RepositoryAuthorizationContext,
    policyId: string
  ): Promise<void> {
    // First verify the policy belongs to the organization
    const existing = await this.policyDelegate.findUnique({ where: { id: policyId } });
    if (!existing || existing.orgId !== context.orgId) {
      throw new Error('DLP policy not found');
    }

    await this.policyDelegate.delete({ where: { id: policyId } });
    await this.invalidateScope(context.orgId, context.dataClassification, context.dataResidency);
  }

  async getActivePoliciesByOrg(
    context: RepositoryAuthorizationContext
  ): Promise<DlpPolicy[]> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_DLP_POLICIES,
      context.dataClassification,
      context.dataResidency,
    );

    const records = await this.policyDelegate.findMany({
      where: {
        orgId: context.orgId,
        enabled: true,
      },
      include: { rules: true },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(record => this.mapToDomain(record));
  }

  private mapToDomain(prismaPolicy: DlpPolicyRecord): DlpPolicy {
    return {
      id: prismaPolicy.id,
      orgId: prismaPolicy.orgId,
      name: prismaPolicy.name,
      description: prismaPolicy.description,
      enabled: prismaPolicy.enabled,
      rules: prismaPolicy.rules.map(rule => ({
        id: rule.id,
        pattern: rule.pattern,
        dataType: rule.dataType,
        action: rule.action,
        severity: rule.severity,
        exceptions: rule.exceptions,
      })),
      createdAt: prismaPolicy.createdAt,
      updatedAt: prismaPolicy.updatedAt,
    };
  }

  private async invalidateScope(
    orgId: string,
    classification: DataClassificationLevel,
    residency: DataResidencyZone
  ): Promise<void> {
    await invalidateOrgCache(orgId, CACHE_SCOPE_DLP_POLICIES, classification, residency);
  }
}
