import type { StatutoryReport, Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { IStatutoryReportRepository } from '@/server/repositories/contracts/records/statutory-report-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { StatutoryReportFilters, StatutoryReportCreationData, StatutoryReportUpdateData } from './prisma-statutory-report-repository.types';

export class PrismaStatutoryReportRepository extends BasePrismaRepository implements IStatutoryReportRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<StatutoryReport | null> {
    return getModelDelegate(this.prisma, 'statutoryReport').findUnique({
      where: { id },
    });
  }

  async findByOrgAndTypeAndPeriod(
    orgId: string,
    reportType: string,
    period: string
  ): Promise<StatutoryReport | null> {
    return getModelDelegate(this.prisma, 'statutoryReport').findFirst({
      where: {
        orgId,
        reportType,
        period,
      },
    });
  }

  async findAll(filters?: StatutoryReportFilters): Promise<StatutoryReport[]> {
    const whereClause: Prisma.StatutoryReportWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.reportType) {
      whereClause.reportType = filters.reportType;
    }

    if (filters?.period) {
      whereClause.period = filters.period;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.dateFrom && filters?.dateTo) {
      whereClause.createdAt = { gte: filters.dateFrom, lte: filters.dateTo };
    } else if (filters?.dateFrom) {
      whereClause.createdAt = { gte: filters.dateFrom };
    } else if (filters?.dateTo) {
      whereClause.createdAt = { lte: filters.dateTo };
    }

    return getModelDelegate(this.prisma, 'statutoryReport').findMany({
      where: whereClause,
      orderBy: { dueDate: 'desc' },
    });
  }

  async create(data: StatutoryReportCreationData): Promise<StatutoryReport> {
    return getModelDelegate(this.prisma, 'statutoryReport').create({
      data: {
        ...data,
        status: data.status ?? 'pending',
        metadata: toPrismaInputJson(data.metadata),
      },
    });
  }

  async update(id: string, data: StatutoryReportUpdateData): Promise<StatutoryReport> {
    return getModelDelegate(this.prisma, 'statutoryReport').update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<StatutoryReport> {
    return getModelDelegate(this.prisma, 'statutoryReport').delete({
      where: { id },
    });
  }

  async markAsSubmitted(id: string, submittedByOrgId: string, submittedByUserId: string): Promise<StatutoryReport> {
    return getModelDelegate(this.prisma, 'statutoryReport').update({
      where: { id },
      data: {
        status: 'submitted',
        submittedByOrgId,
        submittedByUserId,
        submittedAt: new Date(),
      },
    });
  }
}