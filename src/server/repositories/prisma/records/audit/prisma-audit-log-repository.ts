import type { AuditLog, Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { IAuditLogRepository } from '@/server/repositories/contracts/records/audit-log-repository-contract';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { AuditLogFilters, AuditLogCreationData } from './prisma-audit-log-repository.types';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';

export class PrismaAuditLogRepository extends BasePrismaRepository implements IAuditLogRepository {
  constructor(prisma: PrismaClient = defaultPrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<AuditLog | null> {
    return getModelDelegate(this.prisma, 'auditLog').findUnique({
      where: { id },
    });
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const whereClause: Prisma.AuditLogWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
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

    return getModelDelegate(this.prisma, 'auditLog').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: AuditLogCreationData): Promise<AuditLog> {
    return getModelDelegate(this.prisma, 'auditLog').create({
      data,
    });
  }

  async createBulk(data: AuditLogCreationData[]): Promise<AuditLog[]> {
    return getModelDelegate(this.prisma, 'auditLog').createMany({
      data,
      skipDuplicates: true
    }).then(() => {
      // Since createMany doesn't return the created records, we'll just return empty array
      // In a real implementation, you might want to fetch these records separately if needed
      return [];
    });
  }

  async delete(id: string): Promise<AuditLog> {
    return getModelDelegate(this.prisma, 'auditLog').delete({
      where: { id },
    });
  }

  async deleteByRetentionPolicy(orgId: string, retentionDate: Date): Promise<number> {
    const result = await getModelDelegate(this.prisma, 'auditLog').deleteMany({
      where: {
        orgId,
        createdAt: { lt: retentionDate }
      }
    });
    return result.count;
  }
}
