import type { PerformanceReview } from '@/server/domain/hr/performance/types';
import type { PrismaJsonValue } from '@/server/types/prisma';

interface PerformanceReviewRecord {
  id: string;
  orgId: string;
  userId: string;
  reviewerOrgId: string;
  reviewerUserId: string;
    periodStartDate: Date;
    periodEndDate: Date;
    scheduledDate: Date;
    completedDate?: Date | null;
    status: PerformanceReview['status'];
    overallRating?: number | null;
    strengths?: string | null;
    areasForImprovement?: string | null;
    developmentPlan?: PrismaJsonValue | null;
    reviewerNotes?: string | null;
    employeeResponse?: string | null;
    metadata?: PrismaJsonValue | null;
    createdAt: Date;
    updatedAt: Date;
}

interface PerformanceReviewCreatePayload {
  orgId: string;
  userId: string;
  reviewerOrgId: string;
  reviewerUserId: string;
    periodStartDate: Date;
    periodEndDate: Date;
    scheduledDate: Date;
    completedDate?: Date | null;
    status: PerformanceReview['status'];
    overallRating?: number | null;
    strengths?: string | null;
    areasForImprovement?: string | null;
    developmentPlan?: PrismaJsonValue | null;
    reviewerNotes?: string | null;
    employeeResponse?: string | null;
    metadata?: PrismaJsonValue | null;
    createdAt: Date;
    updatedAt: Date;
}

export function mapPrismaPerformanceReviewToDomain(record: PerformanceReviewRecord): PerformanceReview {
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
        developmentPlan: toDomainJsonValue(record.developmentPlan),
        reviewerNotes: record.reviewerNotes ?? null,
        employeeResponse: record.employeeResponse ?? null,
        metadata: toDomainJsonValue(record.metadata),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainPerformanceReviewToPrisma(input: PerformanceReview): PerformanceReviewCreatePayload {
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
        developmentPlan: input.developmentPlan ?? null,
        reviewerNotes: input.reviewerNotes ?? null,
        employeeResponse: input.employeeResponse ?? null,
        metadata: input.metadata ?? null,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    } satisfies PerformanceReviewCreatePayload;
}

function toDomainJsonValue(
    value: PrismaJsonValue | null | undefined,
): PerformanceReview['developmentPlan'] | null | undefined {
    if (value === undefined) {
        return undefined;
    }
    return value as PerformanceReview['developmentPlan'];
}
