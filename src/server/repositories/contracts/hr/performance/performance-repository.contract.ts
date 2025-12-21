import type {
    JsonValue,
    PerformanceGoal,
    PerformanceGoalStatus,
    PerformanceReview,
    PerformanceReviewStatus,
} from '@/server/domain/hr/performance/types';

export interface CreateReviewDTO {
    employeeId: string;
    reviewerUserId: string;
    periodStartDate: Date;
    periodEndDate: Date;
    scheduledDate: Date;
    completedDate?: Date | null;
    status?: PerformanceReviewStatus;
    overallRating?: number | null;
    strengths?: string | null;
    areasForImprovement?: string | null;
    developmentPlan?: JsonValue;
    reviewerNotes?: string | null;
    employeeResponse?: string | null;
    metadata?: JsonValue;
}

export interface UpdateReviewDTO {
    periodStartDate?: Date;
    periodEndDate?: Date;
    scheduledDate?: Date;
    completedDate?: Date | null;
    status?: PerformanceReviewStatus;
    overallRating?: number | null;
    strengths?: string | null;
    areasForImprovement?: string | null;
    developmentPlan?: JsonValue;
    reviewerNotes?: string | null;
    employeeResponse?: string | null;
    metadata?: JsonValue;
}

export interface CreateGoalDTO {
    description: string;
    targetDate: Date;
    status?: PerformanceGoalStatus;
    rating?: number | null;
    comments?: string | null;
}

export interface UpdateGoalDTO {
    description?: string;
    targetDate?: Date;
    status?: PerformanceGoalStatus;
    rating?: number | null;
    comments?: string | null;
}

export interface PerformanceRepository {
    getReviewById(id: string): Promise<PerformanceReview | null>;
    getReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]>;
    getGoalsByReviewId(reviewId: string): Promise<PerformanceGoal[]>;
    createReview(data: CreateReviewDTO): Promise<PerformanceReview>;
    updateReview(id: string, data: UpdateReviewDTO): Promise<PerformanceReview>;
    addGoal(reviewId: string, goal: CreateGoalDTO): Promise<PerformanceGoal>;
    updateGoal(goalId: string, data: UpdateGoalDTO): Promise<PerformanceGoal>;
    deleteGoal(goalId: string): Promise<void>;
    deleteReview(id: string): Promise<void>;
}
