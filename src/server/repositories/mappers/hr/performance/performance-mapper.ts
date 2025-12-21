import type { PerformanceReview } from '@/server/types/hr-types';
import { Prisma, type PerformanceReview as PrismaPerformanceReview } from '@prisma/client';

export function mapPrismaPerformanceReviewToDomain(record: PrismaPerformanceReview): PerformanceReview {
    return {
        id: record.id,
        orgId: record.orgId,
        userId: record.userId,
        reviewerOrgId: record.reviewerOrgId,
        reviewerUserId: record.reviewerUserId,
        periodStartDate: record.periodStartDate,
        periodEndDate: record.periodEndDate,
        scheduledDate: record.scheduledDate,
        completedDate: record.completedDate ?? null,
        status: record.status,
        overallRating: record.overallRating ?? null,
        strengths: record.strengths ?? null,
        areasForImprovement: record.areasForImprovement ?? null,
        developmentPlan: record.developmentPlan as PerformanceReview['developmentPlan'],
        reviewerNotes: record.reviewerNotes ?? null,
        employeeResponse: record.employeeResponse ?? null,
        metadata: record.metadata as PerformanceReview['metadata'],
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainPerformanceReviewToPrisma(input: PerformanceReview): Prisma.PerformanceReviewUncheckedCreateInput {
    return {
        orgId: input.orgId,
        userId: input.userId,
        reviewerOrgId: input.reviewerOrgId,
        reviewerUserId: input.reviewerUserId,
        periodStartDate: input.periodStartDate,
        periodEndDate: input.periodEndDate,
        scheduledDate: input.scheduledDate,
        completedDate: input.completedDate ?? null,
        status: input.status,
        overallRating: input.overallRating ?? null,
        strengths: input.strengths ?? null,
        areasForImprovement: input.areasForImprovement ?? null,
        developmentPlan: input.developmentPlan === null ? Prisma.JsonNull : (input.developmentPlan as Prisma.InputJsonValue | undefined),
        reviewerNotes: input.reviewerNotes ?? null,
        employeeResponse: input.employeeResponse ?? null,
        metadata: input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue | undefined),
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}
