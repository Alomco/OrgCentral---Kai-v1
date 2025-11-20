import type { ComplianceRecord, Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { IComplianceRecordRepository } from '@/server/repositories/contracts/records/compliance-record-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ComplianceRecordFilters, ComplianceRecordCreationData, ComplianceRecordUpdateData } from './prisma-compliance-record-repository.types';

export class PrismaComplianceRecordRepository extends BasePrismaRepository implements IComplianceRecordRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<ComplianceRecord | null> {
    return getModelDelegate(this.prisma, 'complianceRecord').findUnique({
      where: { id },
    });
  }

  async findByReferenceNumber(orgId: string, referenceNumber: string): Promise<ComplianceRecord | null> {
    return getModelDelegate(this.prisma, 'complianceRecord').findFirst({
      where: { orgId, referenceNumber },
    });
  }

  async findAll(filters?: ComplianceRecordFilters): Promise<ComplianceRecord[]> {
    const whereClause: Prisma.ComplianceRecordWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.complianceType) {
      whereClause.complianceType = filters.complianceType;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.priority) {
      whereClause.priority = filters.priority;
    }

    if (filters?.submittedByUserId) {
      whereClause.submittedByUserId = filters.submittedByUserId;
    }
    if (filters?.submittedByOrgId) {
      whereClause.submittedByOrgId = filters.submittedByOrgId;
    }

    if (filters?.assignedToUserId) {
      whereClause.assignedToUserId = filters.assignedToUserId;
    }

    if (filters?.dateFrom) {
      whereClause.createdAt = { gte: filters.dateFrom };
    }

    if (filters?.dateFrom && filters?.dateTo) {
      whereClause.createdAt = { gte: filters.dateFrom, lte: filters.dateTo };
    } else if (filters?.dateFrom) {
      whereClause.createdAt = { gte: filters.dateFrom };
    } else if (filters?.dateTo) {
      whereClause.createdAt = { lte: filters.dateTo };
    }

    return getModelDelegate(this.prisma, 'complianceRecord').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ComplianceRecordCreationData): Promise<ComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').create({
      data: {
        ...data,
        status: data.status ?? 'open',
        priority: data.priority ?? 2,
        submittedAt: data.submittedAt ?? new Date(),
        metadata: data.metadata ? toPrismaInputJson(data.metadata) as Prisma.InputJsonValue : undefined,
      },
    });
  }

  async update(id: string, data: ComplianceRecordUpdateData): Promise<ComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<ComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string): Promise<ComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      },
    });
  }
}