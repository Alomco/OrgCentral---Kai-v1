import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_SECURITY_METRICS } from '@/server/repositories/cache-scopes';
import type { ISecurityMetricsRepository } from '@/server/repositories/contracts/security/enhanced-security-repository-contracts';
import type { SecurityMetrics } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type {
  SecurityMetricsCreateInput,
  SecurityMetricsDelegate,
  SecurityMetricsRecord,
  SecurityMetricsUpdateInput,
} from './prisma-security-metrics-repository.types';

export class PrismaSecurityMetricsRepository
  extends BasePrismaRepository
  implements ISecurityMetricsRepository {
  private get metricsDelegate(): SecurityMetricsDelegate {
    const delegate = (this.prisma as { securityMetrics?: SecurityMetricsDelegate }).securityMetrics;
    if (!delegate) {
      throw new Error('Security metrics delegate is not available on Prisma client.');
    }
    return delegate;
  }

  async createMetrics(
    context: RepositoryAuthorizationContext,
    metrics: Omit<SecurityMetrics, 'id'>
  ): Promise<SecurityMetrics> {
    // Validate tenant isolation
    if (metrics.orgId !== context.orgId) {
      throw new Error('Cannot create security metrics for another organization');
    }

    // Ensure tenant-scoped caching
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_METRICS,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.metricsDelegate.upsert({
      where: {
        orgId_periodStart_periodEnd: {
          orgId: metrics.orgId,
          periodStart: metrics.periodStart,
          periodEnd: metrics.periodEnd,
        },
      },
      update: {
        ...this.toPrismaUpdateMetrics(metrics),
        updatedAt: new Date(),
      },
      create: {
        ...this.toPrismaCreateMetrics(metrics),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await this.invalidateScope(context.orgId, context.dataClassification, context.dataResidency);
    return this.mapToDomain(record);
  }

  async getMetrics(
    context: RepositoryAuthorizationContext,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SecurityMetrics | null> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_METRICS,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.metricsDelegate.findUnique({
      where: {
        orgId_periodStart_periodEnd: {
          orgId: context.orgId,
          periodStart,
          periodEnd,
        },
      },
    });

    if (!record) {
      return null;
    }

    // Enforce tenant isolation (should always pass due to the where clause)
    if (record.orgId !== context.orgId) {
      return null;
    }

    return this.mapToDomain(record);
  }

  async getLatestMetrics(
    context: RepositoryAuthorizationContext
  ): Promise<SecurityMetrics | null> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_METRICS,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.metricsDelegate.findFirst({
      where: { orgId: context.orgId },
      orderBy: { periodEnd: 'desc' },
    });

    if (!record) {
      return null;
    }

    return this.mapToDomain(record);
  }

  async updateMetrics(
    context: RepositoryAuthorizationContext,
    periodStart: Date,
    periodEnd: Date,
    updates: Partial<SecurityMetrics>
  ): Promise<void> {
    // First verify the metrics record belongs to the organization
    const existing = await this.metricsDelegate.findUnique({
      where: {
        orgId_periodStart_periodEnd: {
          orgId: context.orgId,
          periodStart,
          periodEnd,
        },
      },
    });

    if (!existing) {
      throw new Error('Security metrics record not found');
    }

    await this.metricsDelegate.update({
      where: {
        orgId_periodStart_periodEnd: {
          orgId: context.orgId,
          periodStart,
          periodEnd,
        },
      },
      data: {
        ...this.toPrismaUpdateMetrics(updates),
        updatedAt: new Date(),
      },
    });

    await this.invalidateScope(context.orgId, context.dataClassification, context.dataResidency);
  }

  private toPrismaCreateMetrics(
    metrics: Omit<SecurityMetrics, 'id'>,
  ): SecurityMetricsCreateInput {
    return {
      orgId: metrics.orgId,
      periodStart: metrics.periodStart,
      periodEnd: metrics.periodEnd,
      totalEvents: metrics.totalEvents,
      securityEvents: metrics.securityEvents,
      incidents: metrics.incidents,
      alertsGenerated: metrics.alertsGenerated,
      alertsResolved: metrics.alertsResolved,
      meanTimeToDetection: metrics.meanTimeToDetection,
      meanTimeToResolution: metrics.meanTimeToResolution,
      complianceScore: metrics.complianceScore,
      dlpViolations: metrics.dlpViolations,
      accessViolations: metrics.accessViolations,
      dataBreachAttempts: metrics.dataBreachAttempts,
      successfulPhishingSimulations: metrics.successfulPhishingSimulations,
      securityTrainingCompletionRate: metrics.securityTrainingCompletionRate,
    };
  }

  private toPrismaUpdateMetrics(
    metrics: Partial<SecurityMetrics>,
  ): SecurityMetricsUpdateInput {
    return {
      totalEvents: metrics.totalEvents,
      securityEvents: metrics.securityEvents,
      incidents: metrics.incidents,
      alertsGenerated: metrics.alertsGenerated,
      alertsResolved: metrics.alertsResolved,
      meanTimeToDetection: metrics.meanTimeToDetection,
      meanTimeToResolution: metrics.meanTimeToResolution,
      complianceScore: metrics.complianceScore,
      dlpViolations: metrics.dlpViolations,
      accessViolations: metrics.accessViolations,
      dataBreachAttempts: metrics.dataBreachAttempts,
      successfulPhishingSimulations: metrics.successfulPhishingSimulations,
      securityTrainingCompletionRate: metrics.securityTrainingCompletionRate,
    };
  }

  private mapToDomain(prismaMetrics: SecurityMetricsRecord): SecurityMetrics {
    return {
      orgId: prismaMetrics.orgId,
      periodStart: prismaMetrics.periodStart,
      periodEnd: prismaMetrics.periodEnd,
      totalEvents: prismaMetrics.totalEvents,
      securityEvents: prismaMetrics.securityEvents,
      incidents: prismaMetrics.incidents,
      alertsGenerated: prismaMetrics.alertsGenerated,
      alertsResolved: prismaMetrics.alertsResolved,
      meanTimeToDetection: prismaMetrics.meanTimeToDetection,
      meanTimeToResolution: prismaMetrics.meanTimeToResolution,
      complianceScore: prismaMetrics.complianceScore,
      dlpViolations: prismaMetrics.dlpViolations,
      accessViolations: prismaMetrics.accessViolations,
      dataBreachAttempts: prismaMetrics.dataBreachAttempts,
      successfulPhishingSimulations: prismaMetrics.successfulPhishingSimulations,
      securityTrainingCompletionRate: prismaMetrics.securityTrainingCompletionRate,
    };
  }

  private async invalidateScope(
    orgId: string,
    classification: DataClassificationLevel,
    residency: DataResidencyZone
  ): Promise<void> {
    await invalidateOrgCache(orgId, CACHE_SCOPE_SECURITY_METRICS, classification, residency);
  }
}
