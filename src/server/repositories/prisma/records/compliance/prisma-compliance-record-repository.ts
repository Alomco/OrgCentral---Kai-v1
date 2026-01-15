import type { IComplianceRecordRepository } from '@/server/repositories/contracts/records/compliance-record-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ComplianceRecordFilters, ComplianceRecordCreationData, ComplianceRecordUpdateData } from './prisma-compliance-record-repository.types';
import { Prisma } from '@/server/types/prisma';
import type { PrismaComplianceRecord } from '@/server/types/prisma';

export class PrismaComplianceRecordRepository extends BasePrismaRepository implements IComplianceRecordRepository {
  async findById(id: string): Promise<PrismaComplianceRecord | null> {
    return getModelDelegate(this.prisma, 'complianceRecord').findUnique({
      where: { id },
    });
  }

  async findByReferenceNumber(orgId: string, referenceNumber: string): Promise<PrismaComplianceRecord | null> {
    return getModelDelegate(this.prisma, 'complianceRecord').findFirst({
      where: { orgId, referenceNumber },
    });
  }

  async findAll(filters?: ComplianceRecordFilters): Promise<PrismaComplianceRecord[]> {
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

    const dateFrom = filters?.dateFrom;
    const dateTo = filters?.dateTo;
    if (dateFrom && dateTo) {
      whereClause.createdAt = { gte: dateFrom, lte: dateTo };
    } else if (dateFrom) {
      whereClause.createdAt = { gte: dateFrom };
    } else if (dateTo) {
      whereClause.createdAt = { lte: dateTo };
    }

    return getModelDelegate(this.prisma, 'complianceRecord').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: ComplianceRecordCreationData): Promise<PrismaComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').create({
      data: {
        ...data,
        status: data.status ?? 'open',
        priority: data.priority ?? 2,
        submittedAt: data.submittedAt ?? new Date(),
        metadata:
          data.metadata === undefined
            ? undefined
            : toPrismaInputJson(data.metadata) ?? Prisma.JsonNull,
      },
    });
  }

  async update(id: string, data: ComplianceRecordUpdateData): Promise<PrismaComplianceRecord> {
    const updateData = {
      ...data,
      metadata:
        data.metadata === undefined
          ? undefined
          : toPrismaInputJson(data.metadata) ?? Prisma.JsonNull,
    };
    return getModelDelegate(this.prisma, 'complianceRecord').update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<PrismaComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string): Promise<PrismaComplianceRecord> {
    return getModelDelegate(this.prisma, 'complianceRecord').update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      },
    });
  }
}
