import type { DataSubjectRight, Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { IDataSubjectRightsRepository } from '@/server/repositories/contracts/records/data-subject-rights-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { DataSubjectRightFilters, DataSubjectRightCreationData, DataSubjectRightUpdateData } from './prisma-data-subject-rights-repository.types';

export class PrismaDataSubjectRightsRepository extends BasePrismaRepository implements IDataSubjectRightsRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<DataSubjectRight | null> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').findUnique({
      where: { id },
    });
  }

  async findByOrgAndRightType(orgId: string, rightType: string): Promise<DataSubjectRight[]> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').findMany({
      where: {
        orgId,
        rightType
      },
      orderBy: { requestDate: 'desc' },
    });
  }

  async findAll(filters?: DataSubjectRightFilters): Promise<DataSubjectRight[]> {
    const whereClause: Prisma.DataSubjectRightWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters?.rightType) {
      whereClause.rightType = filters.rightType;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.dateFrom && filters?.dateTo) {
      whereClause.requestDate = { gte: filters.dateFrom, lte: filters.dateTo };
    } else if (filters?.dateFrom) {
      whereClause.requestDate = { gte: filters.dateFrom };
    } else if (filters?.dateTo) {
      whereClause.requestDate = { lte: filters.dateTo };
    }

    return getModelDelegate(this.prisma, 'dataSubjectRight').findMany({
      where: whereClause,
      orderBy: { requestDate: 'desc' },
    });
  }

  async create(data: DataSubjectRightCreationData): Promise<DataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').create({
      data: {
        ...data,
        status: data.status ?? 'pending',
        requestDate: data.requestDate ?? new Date(),
        dataSubjectInfo: toPrismaInputJson(data.dataSubjectInfo),
        metadata: toPrismaInputJson(data.metadata),
      },
    });
  }

  async update(id: string, data: DataSubjectRightUpdateData): Promise<DataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<DataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').delete({
      where: { id },
    });
  }

  async markAsCompleted(id: string, response: string, responseFrom: string): Promise<DataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').update({
      where: { id },
      data: {
        status: 'completed',
        response,
        responseFrom,
        responseDate: new Date(),
        completedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<DataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      },
    });
  }
}