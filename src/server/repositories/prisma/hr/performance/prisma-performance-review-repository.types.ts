import type { Prisma } from '@prisma/client';

export interface PerformanceReviewFilters {
    orgId?: string;
    userId?: string;
    reviewerUserId?: string;
    reviewPeriod?: string;
    status?: string;
}

export type PerformanceReviewCreationData = Prisma.PerformanceReviewUncheckedCreateInput;

export type PerformanceReviewUpdateData = Prisma.PerformanceReviewUncheckedUpdateInput;
