import { Prisma, type PerformanceReview as PrismaPerformanceReview } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IPerformanceReviewRepository } from '@/server/repositories/contracts/hr/performance/performance-review-repository-contract';
import { mapPrismaPerformanceReviewToDomain, mapDomainPerformanceReviewToPrisma } from '@/server/repositories/mappers/hr/performance/performance-mapper';
import type { PerformanceReview as DomainPerformanceReview } from '@/server/types/hr-types';
import type { PerformanceReviewFilters, PerformanceReviewCreationData, PerformanceReviewUpdateData } from './prisma-performance-review-repository.types';
import { EntityNotFoundError } from '@/server/errors';

export class PrismaPerformanceReviewRepository extends BasePrismaRepository implements IPerformanceReviewRepository {
  // BasePrismaRepository provides prisma client via DI

  private static toJsonInput(value?: Prisma.JsonValue | null): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === null) { return Prisma.JsonNull; }
    if (value === undefined) { return undefined; }
    return value as Prisma.InputJsonValue;
  }

  async findById(id: string): Promise<PrismaPerformanceReview | null> {
    return this.prisma.performanceReview.findUnique({ where: { id } });
  }

  async findByUserAndPeriod(orgId: string, userId: string, reviewPeriod: string): Promise<PrismaPerformanceReview | null> {
    // The Prisma schema defines indexes but no unique constraint on [orgId, userId, reviewPeriod],
    // so use findFirst with a where clause instead of findUnique with a composite unique property.
    return this.prisma.performanceReview.findFirst({ where: { orgId, userId, reviewPeriod } });
  }

  async findAll(filters?: PerformanceReviewFilters): Promise<PrismaPerformanceReview[]> {
    const whereClause: Prisma.PerformanceReviewWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    if (filters?.reviewerUserId) {
      whereClause.reviewerUserId = filters.reviewerUserId;
    }

    if (filters?.reviewPeriod) {
      whereClause.reviewPeriod = filters.reviewPeriod;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    return this.prisma.performanceReview.findMany({ where: whereClause, orderBy: { scheduledDate: 'desc' } });
  }

  async create(data: PerformanceReviewCreationData): Promise<PrismaPerformanceReview> {
    // Ensure the object shape meets Prisma's create input requirements (orgId, userId etc.)
    const prismaCreate = { ...data, status: data.status ?? 'scheduled' };
    return this.prisma.performanceReview.create({ data: prismaCreate });
  }

  async update(id: string, data: PerformanceReviewUpdateData): Promise<PrismaPerformanceReview> {
    const prismaUpdate = data;
    return this.prisma.performanceReview.update({ where: { id }, data: prismaUpdate });
  }

  async delete(id: string): Promise<PrismaPerformanceReview> {
    return this.prisma.performanceReview.delete({ where: { id } });
  }

  // Contract methods mapping to domain types
  async createPerformanceReview(tenantId: string, review: Omit<DomainPerformanceReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    // Inject orgId (tenant) and ensure createdAt/updatedAt exist in the DTO passed to mapper
    const input = { ...review, orgId: tenantId, createdAt: new Date(), updatedAt: new Date() } as DomainPerformanceReview;
    const prismaCreate = mapDomainPerformanceReviewToPrisma(input);
    await this.create(prismaCreate);
  }

  async updatePerformanceReview(tenantId: string, reviewId: string, updates: Partial<Omit<DomainPerformanceReview, 'id' | 'orgId' | 'createdAt' | 'userId'>>): Promise<void> {
    const existing = await this.findById(reviewId);
    if (existing?.orgId !== tenantId) { throw new EntityNotFoundError('Performance review', { reviewId, orgId: tenantId }); }
    const updateData: PerformanceReviewUpdateData = {} as PerformanceReviewUpdateData;
    if (updates.status !== undefined) { updateData.status = updates.status; }
    if (updates.overallRating !== undefined) { updateData.overallRating = updates.overallRating ?? null; }
    if (updates.developmentPlan !== undefined) { updateData.developmentPlan = PrismaPerformanceReviewRepository.toJsonInput(updates.developmentPlan as Prisma.JsonValue | null | undefined); }
    if (updates.goalsMet !== undefined) { updateData.goalsMet = PrismaPerformanceReviewRepository.toJsonInput(updates.goalsMet as Prisma.JsonValue | null | undefined); }
    if (updates.reviewerNotes !== undefined) { updateData.reviewerNotes = updates.reviewerNotes ?? null; }
    if (updates.employeeResponse !== undefined) { updateData.employeeResponse = updates.employeeResponse ?? null; }
    if (updates.completedDate !== undefined) { updateData.completedDate = updates.completedDate ?? null; }
    if (updates.metadata !== undefined) { updateData.metadata = PrismaPerformanceReviewRepository.toJsonInput(updates.metadata as Prisma.JsonValue | null | undefined); }
    await this.update(reviewId, updateData);
  }

  async getPerformanceReview(tenantId: string, reviewId: string): Promise<DomainPerformanceReview | null> {
    const rec = await this.findById(reviewId);
    if (rec?.orgId !== tenantId) { return null; }
    return mapPrismaPerformanceReviewToDomain(rec);
  }

  async getPerformanceReviewsByEmployee(tenantId: string, employeeId: string): Promise<DomainPerformanceReview[]> {
    const recs = await this.findAll({ orgId: tenantId, userId: employeeId });
    return recs.map(mapPrismaPerformanceReviewToDomain);
  }

  async getPerformanceReviewsByOrganization(tenantId: string, filters?: { status?: string; reviewerId?: string; reviewPeriod?: string; startDate?: Date; endDate?: Date; }): Promise<DomainPerformanceReview[]> {
    const recs = await this.findAll({ orgId: tenantId, status: filters?.status, reviewPeriod: filters?.reviewPeriod, reviewerUserId: filters?.reviewerId });
    return recs.map(mapPrismaPerformanceReviewToDomain);
  }

  async deletePerformanceReview(tenantId: string, reviewId: string): Promise<void> {
    const existing = await this.findById(reviewId);
    if (existing?.orgId !== tenantId) { throw new EntityNotFoundError('Performance review', { reviewId, orgId: tenantId }); }
    await this.delete(reviewId);
  }
}
