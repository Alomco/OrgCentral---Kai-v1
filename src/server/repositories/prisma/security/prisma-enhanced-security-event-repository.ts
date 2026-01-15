import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_SECURITY_EVENTS } from '@/server/repositories/cache-scopes';
import type { ISecurityEventRepository } from '@/server/repositories/contracts/security/enhanced-security-repository-contracts';
import type { EnhancedSecurityEvent } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import {
  type DataClassificationLevel,
  type DataResidencyZone,
} from '@/server/types/tenant';
import {
  mapToDomain,
  buildWhereClause,
  toCreationData,
} from '@/server/repositories/mappers/auth/security/security-event-mapper';
import {
  buildAdditionalInfo,
  extractEnhancedFields,
} from './prisma-enhanced-security-event-repository.helpers';

export class PrismaEnhancedSecurityEventRepository
  extends BasePrismaRepository
  implements ISecurityEventRepository {
  async createEvent(
    context: RepositoryAuthorizationContext,
    event: Omit<EnhancedSecurityEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EnhancedSecurityEvent> {
    // Validate tenant isolation
    if (event.orgId !== context.orgId) {
      throw new Error('Cannot create security event for another organization');
    }

    // Ensure tenant-scoped caching
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_EVENTS,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.prisma.securityEvent.create({
      data: {
        ...toCreationData(context.orgId, {
          orgId: event.orgId,
          userId: event.userId,
          eventType: event.eventType,
          severity: event.severity,
          description: event.description,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          additionalInfo: buildAdditionalInfo(event),
          resolved: false,
          resolvedAt: null,
          resolvedBy: null,
        }),
        resolved: false,
        resolvedAt: null,
        resolvedBy: null,
      },
    });

    await this.invalidateScope(context.orgId, context.dataClassification, context.dataResidency);
    const enriched = extractEnhancedFields(record.additionalInfo);
    return {
      ...mapToDomain(record),
      tenantScope: context.tenantScope,
      dataClassification: enriched.dataClassification ?? event.dataClassification,
      dataResidency: enriched.dataResidency ?? event.dataResidency,
      resourceId: enriched.resourceId ?? event.resourceId,
      resourceType: enriched.resourceType ?? event.resourceType,
      metadata: enriched.metadata ?? event.metadata,
      piiDetected: enriched.piiDetected ?? event.piiDetected,
      piiAccessed: enriched.piiAccessed ?? event.piiAccessed,
      dataBreachPotential: enriched.dataBreachPotential ?? event.dataBreachPotential,
      remediationSteps: enriched.remediationSteps ?? event.remediationSteps,
    };
  }

  async getEvent(
    context: RepositoryAuthorizationContext,
    eventId: string
  ): Promise<EnhancedSecurityEvent | null> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_EVENTS,
      context.dataClassification,
      context.dataResidency,
    );

    const record = await this.prisma.securityEvent.findUnique({ where: { id: eventId } });

    if (!record) {
      return null;
    }

    // Enforce tenant isolation
    if (record.orgId !== context.orgId) {
      return null;
    }

    const enriched = extractEnhancedFields(record.additionalInfo);
    return {
      ...mapToDomain(record),
      tenantScope: context.tenantScope,
      dataClassification: enriched.dataClassification ?? context.dataClassification,
      dataResidency: enriched.dataResidency ?? context.dataResidency,
      resourceId: enriched.resourceId,
      resourceType: enriched.resourceType,
      metadata: enriched.metadata,
      piiDetected: enriched.piiDetected,
      piiAccessed: enriched.piiAccessed,
      dataBreachPotential: enriched.dataBreachPotential,
      remediationSteps: enriched.remediationSteps,
    };
  }

  async getEventsByOrg(
    context: RepositoryAuthorizationContext,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      severity?: string;
      eventType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<EnhancedSecurityEvent[]> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_EVENTS,
      context.dataClassification,
      context.dataResidency,
    );

    const whereClause = {
      ...buildWhereClause({
        orgId: context.orgId,
        eventType: filters?.eventType,
        severity: filters?.severity,
        dateFrom: filters?.startDate,
        dateTo: filters?.endDate,
      }),
    };

    const records = await this.prisma.securityEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return records.map((record) => {
      const enriched = extractEnhancedFields(record.additionalInfo);
      return {
        ...mapToDomain(record),
        tenantScope: context.tenantScope,
        dataClassification: enriched.dataClassification ?? context.dataClassification,
        dataResidency: enriched.dataResidency ?? context.dataResidency,
        resourceId: enriched.resourceId,
        resourceType: enriched.resourceType,
        metadata: enriched.metadata,
        piiDetected: enriched.piiDetected,
        piiAccessed: enriched.piiAccessed,
        dataBreachPotential: enriched.dataBreachPotential,
        remediationSteps: enriched.remediationSteps,
      };
    });
  }

  async countEventsByOrg(
    context: RepositoryAuthorizationContext,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      severity?: string;
      eventType?: string;
    }
  ): Promise<number> {
    registerOrgCacheTag(
      context.orgId,
      CACHE_SCOPE_SECURITY_EVENTS,
      context.dataClassification,
      context.dataResidency,
    );

    const whereClause = {
      ...buildWhereClause({
        orgId: context.orgId,
        eventType: filters?.eventType,
        severity: filters?.severity,
        dateFrom: filters?.startDate,
        dateTo: filters?.endDate,
      }),
    };

    return this.prisma.securityEvent.count({
      where: whereClause,
    });
  }

  private async invalidateScope(
    orgId: string,
    classification: DataClassificationLevel,
    residency: DataResidencyZone
  ): Promise<void> {
    await invalidateOrgCache(orgId, CACHE_SCOPE_SECURITY_EVENTS, classification, residency);
  }
}
