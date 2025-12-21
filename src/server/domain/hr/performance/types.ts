export type JsonValue =
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

export type PerformanceGoalStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Prisma stores review status as a string (not an enum).
 * Keep this permissive while still guiding common values.
 */
export type PerformanceReviewStatus =
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | (string & {});

export interface PerformanceGoal {
    id: string;
    orgId: string;
    reviewId: string;
    description: string;
    targetDate: Date;
    status: PerformanceGoalStatus;
    rating?: number | null;
    comments?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PerformanceReview {
    id: string;
    orgId: string;
    userId: string;
    reviewerOrgId: string;
    reviewerUserId: string;
    periodStartDate: Date;
    periodEndDate: Date;
    scheduledDate: Date;
    completedDate?: Date | null;
    status: PerformanceReviewStatus;
    overallRating?: number | null;
    strengths?: string | null;
    areasForImprovement?: string | null;
    developmentPlan?: JsonValue;
    reviewerNotes?: string | null;
    employeeResponse?: string | null;
    metadata?: JsonValue;
    createdAt: Date;
    updatedAt: Date;
}

export type PerformanceReviewWithGoals = PerformanceReview & { goals: PerformanceGoal[] };
