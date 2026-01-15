import type { IAuditLogRepository } from '@/server/repositories/contracts/records/audit-log-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository, type BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { AuditLogFilters, AuditLogCreationData, AuditLogRecord } from './prisma-audit-log-repository.types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import { Prisma } from '@/server/types/prisma';
import type {
  PrismaClientInstance,
  PrismaInputJsonValue,
  PrismaNullableJsonNullValueInput,
} from '@/server/types/prisma';
import { RepositoryAuthorizationError } from '@/server/repositories/security/repository-errors';

export class PrismaAuditLogRepository extends BasePrismaRepository implements IAuditLogRepository {
  constructor(options: BasePrismaRepositoryOptions | PrismaClientInstance = defaultPrismaClient) {
    super(options);
  }

  async findById(context: RepositoryAuthorizationContext, id: string): Promise<AuditLogRecord | null> {
    this.validateDataResidency(context, 'read', 'audit_log');
    this.validatePiiAccess(context, 'read', 'audit_log');

    const record = await getModelDelegate(this.prisma, 'auditLog').findFirst({
      where: { id, deletedAt: null, orgId: context.orgId },
    });

    return record ? this.assertTenantRecord(record, context, 'audit_log') : null;
  }

  async findAll(context: RepositoryAuthorizationContext, filters?: AuditLogFilters): Promise<AuditLogRecord[]> {
    this.validateDataResidency(context, 'read', 'audit_log');
    this.validatePiiAccess(context, 'read', 'audit_log');

    const whereClause: Prisma.AuditLogWhereInput = { orgId: context.orgId, deletedAt: null };

    if (filters?.orgId && filters.orgId !== context.orgId) {
      throw new RepositoryAuthorizationError('Cross-tenant access detected.');
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters?.eventType) {
      whereClause.eventType = filters.eventType;
    }

    if (filters?.action) {
      whereClause.action = { contains: filters.action, mode: 'insensitive' };
    }

    if (filters?.resource) {
      whereClause.resource = { contains: filters.resource, mode: 'insensitive' };
    }

    if (filters?.dataSubjectId) {
      whereClause.dataSubjectId = filters.dataSubjectId;
    }

    const dateFrom = filters?.dateFrom;
    const dateTo = filters?.dateTo;
    if (dateFrom && dateTo) {
      whereClause.createdAt = { gte: dateFrom, lte: dateTo };
    } else if (dateFrom) {
      whereClause.createdAt = { gte: dateFrom };
    } else if (dateTo) {
      whereClause.createdAt = { lte: dateTo };
    }

    const records = await getModelDelegate(this.prisma, 'auditLog').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.assertTenantRecord(record, context, 'audit_log'));
  }

  async create(context: RepositoryAuthorizationContext, data: AuditLogCreationData): Promise<AuditLogRecord> {
    this.validateTenantWriteAccess(context, data.orgId, 'write');
    this.validateDataResidency(context, 'write', 'audit_log');
    this.validatePiiAccess(context, 'write', 'audit_log');

    const payload = this.stampPayload(data.payload, context);

    const record = await getModelDelegate(this.prisma, 'auditLog').create({
      data: {
        ...data,
        payload,
      },
    });

    return this.assertTenantRecord(record, context, 'audit_log');
  }

  async createBulk(
    context: RepositoryAuthorizationContext,
    data: AuditLogCreationData[],
  ): Promise<AuditLogRecord[]> {
    const normalized = data.map((item) => {
      this.validateTenantWriteAccess(context, item.orgId, 'write');
      return {
        ...item,
        payload: this.stampPayload(item.payload, context),
      };
    });

    await getModelDelegate(this.prisma, 'auditLog').createMany({
      data: normalized,
      skipDuplicates: true,
    });

    return [];
  }

  delete(context: RepositoryAuthorizationContext, _id: string): Promise<AuditLogRecord> {
    void context;
    void _id;
    return Promise.reject(
      new Error('Audit logs are immutable; use retention workflows to expire records.'),
    );
  }

  async deleteByRetentionPolicy(
    context: RepositoryAuthorizationContext,
    retentionDate: Date,
  ): Promise<number> {
    this.validateTenantWriteAccess(context, context.orgId, 'delete');

    const result = await getModelDelegate(this.prisma, 'auditLog').updateMany({
      where: {
        orgId: context.orgId,
        createdAt: { lt: retentionDate },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return result.count;
  }

  private stampPayload(
    payload: AuditLogCreationData['payload'],
    context: RepositoryAuthorizationContext,
  ): PrismaInputJsonValue | PrismaNullableJsonNullValueInput {
    const normalizedPayload =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload
        : payload !== undefined
          ? { value: payload }
          : {};

    return toPrismaInputJson({
      ...normalizedPayload,
      dataClassification: context.dataClassification,
      dataResidency: context.dataResidency,
    }) ?? Prisma.JsonNull;
  }
}
