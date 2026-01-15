import type { IDataSubjectRightsRepository } from '@/server/repositories/contracts/records/data-subject-rights-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { DataSubjectRightFilters, DataSubjectRightCreationData, DataSubjectRightUpdateData } from './prisma-data-subject-rights-repository.types';
import type { Prisma, PrismaDataSubjectRight } from '@/server/types/prisma';

export class PrismaDataSubjectRightsRepository extends BasePrismaRepository implements IDataSubjectRightsRepository {
  async findById(id: string): Promise<PrismaDataSubjectRight | null> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').findUnique({
      where: { id },
    });
  }

  async findByOrgAndRightType(orgId: string, rightType: string): Promise<PrismaDataSubjectRight[]> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').findMany({
      where: {
        orgId,
        rightType
      },
      orderBy: { requestDate: 'desc' },
    });
  }

  async findAll(filters?: DataSubjectRightFilters): Promise<PrismaDataSubjectRight[]> {
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

    const dateFrom = filters?.dateFrom;
    const dateTo = filters?.dateTo;
    if (dateFrom && dateTo) {
      whereClause.requestDate = { gte: dateFrom, lte: dateTo };
    } else if (dateFrom) {
      whereClause.requestDate = { gte: dateFrom };
    } else if (dateTo) {
      whereClause.requestDate = { lte: dateTo };
    }

    return getModelDelegate(this.prisma, 'dataSubjectRight').findMany({
      where: whereClause,
      orderBy: { requestDate: 'desc' },
    });
  }

  async create(data: DataSubjectRightCreationData): Promise<PrismaDataSubjectRight> {
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

  async update(id: string, data: DataSubjectRightUpdateData): Promise<PrismaDataSubjectRight> {
    const updateData = {
      ...data,
      metadata: data.metadata !== undefined ? toPrismaInputJson(data.metadata) : undefined,
    };
    return getModelDelegate(this.prisma, 'dataSubjectRight').update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<PrismaDataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').delete({
      where: { id },
    });
  }

  async markAsCompleted(id: string, response: string, responseFrom: string): Promise<PrismaDataSubjectRight> {
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

  async updateStatus(id: string, status: string): Promise<PrismaDataSubjectRight> {
    return getModelDelegate(this.prisma, 'dataSubjectRight').update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      },
    });
  }
}
