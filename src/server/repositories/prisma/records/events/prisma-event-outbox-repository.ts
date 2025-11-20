import { Prisma } from '@prisma/client';
import type { EventOutbox, PrismaClient } from '@prisma/client';
import type { IEventOutboxRepository } from '@/server/repositories/contracts/records/event-outbox-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { EventOutboxFilters, EventOutboxCreationData, EventOutboxUpdateData } from './prisma-event-outbox-repository.types';

export class PrismaEventOutboxRepository extends BasePrismaRepository implements IEventOutboxRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<EventOutbox | null> {
    return this.prisma.eventOutbox.findUnique({
      where: { id },
    });
  }

  async findAll(filters?: EventOutboxFilters): Promise<EventOutbox[]> {
    const whereClause: Prisma.EventOutboxWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.eventType) {
      whereClause.eventType = filters.eventType;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
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

    return getModelDelegate(this.prisma, 'eventOutbox').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingEvents(limit: number = 100): Promise<EventOutbox[]> {
    return getModelDelegate(this.prisma, 'eventOutbox').findMany({
      where: {
        status: 'pending',
        availableAt: { lte: new Date() },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async findFailedEvents(limit: number = 100): Promise<EventOutbox[]> {
    return getModelDelegate(this.prisma, 'eventOutbox').findMany({
      where: {
        status: 'failed',
        retryCount: { lt: 3 }, // Less than max retries
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(data: EventOutboxCreationData): Promise<EventOutbox> {
    return getModelDelegate(this.prisma, 'eventOutbox').create({
      data: {
        ...data,
        status: data.status ?? 'pending',
        payload: toPrismaInputJson(data.payload) as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, data: EventOutboxUpdateData): Promise<EventOutbox> {
    // Ensure `error` nullability maps correctly to Prisma Null types if needed
    const updateData: EventOutboxUpdateData = { ...data };
    if ('error' in updateData) {
      const err = updateData.error as Prisma.InputJsonValue | null | undefined;
      updateData.error = err === null ? (Prisma.JsonNull as unknown as Prisma.InputJsonValue) : err as Prisma.InputJsonValue;
    }
    return getModelDelegate(this.prisma, 'eventOutbox').update({
      where: { id },
      data: updateData as unknown as Prisma.EventOutboxUpdateInput,
    });
  }

  async markAsProcessing(id: string): Promise<EventOutbox> {
    return getModelDelegate(this.prisma, 'eventOutbox').update({
      where: { id },
      data: {
        status: 'processing',
      },
    });
  }

  async markAsProcessed(id: string): Promise<EventOutbox> {
    return getModelDelegate(this.prisma, 'eventOutbox').update({
      where: { id },
      data: {
        status: 'processed',
        processedAt: new Date(),
      },
    });
  }

  async markAsFailed(id: string, error?: Prisma.InputJsonValue | null): Promise<EventOutbox> {
    const errorStr = error ?? null;
    return getModelDelegate(this.prisma, 'eventOutbox').update({
      where: { id },
      data: {
        status: 'failed',
        error: errorStr as unknown as Prisma.InputJsonValue | typeof Prisma.JsonNull,
        retryCount: {
          increment: 1
        }
      },
    });
  }

  async delete(id: string): Promise<EventOutbox> {
    return getModelDelegate(this.prisma, 'eventOutbox').delete({
      where: { id },
    });
  }

  async cleanupProcessedEvents(orgId: string, olderThan: Date): Promise<number> {
    const result = await getModelDelegate(this.prisma, 'eventOutbox').deleteMany({
      where: {
        orgId,
        status: 'processed',
        processedAt: { lt: olderThan }
      }
    });
    return result.count;
  }
}