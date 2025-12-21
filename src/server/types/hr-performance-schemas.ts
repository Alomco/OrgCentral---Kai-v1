import { z } from 'zod';
import type { JsonValue, PerformanceGoalStatus, PerformanceReviewStatus } from '@/server/domain/hr/performance/types';

function isJsonValue(value: unknown): value is JsonValue {
    if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }

    if (typeof value === 'object') {
        for (const v of Object.values(value as Record<string, unknown>)) {
            if (!isJsonValue(v)) {
                return false;
            }
        }
        return true;
    }

    return false;
}

const jsonValueSchema = z.custom<JsonValue>((value) => isJsonValue(value));

const PERFORMANCE_GOAL_STATUS_VALUES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const performanceGoalStatusSchema = z.enum(PERFORMANCE_GOAL_STATUS_VALUES) as z.ZodType<PerformanceGoalStatus>;

export const createPerformanceReviewSchema = z.object({
    employeeId: z.uuid(),
    reviewerUserId: z.uuid(),
    periodStartDate: z.coerce.date(),
    periodEndDate: z.coerce.date(),
    scheduledDate: z.coerce.date(),
    completedDate: z.coerce.date().nullable().optional(),
    status: z.string().min(1).optional() as z.ZodType<PerformanceReviewStatus | undefined>,
    overallRating: z.coerce.number().int().min(1).max(5).nullable().optional(),
    strengths: z.string().max(5000).nullable().optional(),
    areasForImprovement: z.string().max(5000).nullable().optional(),
    developmentPlan: jsonValueSchema.optional(),
    reviewerNotes: z.string().max(5000).nullable().optional(),
    employeeResponse: z.string().max(5000).nullable().optional(),
    metadata: jsonValueSchema.optional(),
});

export const updatePerformanceReviewSchema = z.object({
    id: z.uuid(),
    periodStartDate: z.coerce.date().optional(),
    periodEndDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().nullable().optional(),
    status: z.string().min(1).optional() as z.ZodType<PerformanceReviewStatus | undefined>,
    overallRating: z.coerce.number().int().min(1).max(5).nullable().optional(),
    strengths: z.string().max(5000).nullable().optional(),
    areasForImprovement: z.string().max(5000).nullable().optional(),
    developmentPlan: jsonValueSchema.optional(),
    reviewerNotes: z.string().max(5000).nullable().optional(),
    employeeResponse: z.string().max(5000).nullable().optional(),
    metadata: jsonValueSchema.optional(),
});

export const getPerformanceReviewSchema = z.object({
    id: z.uuid(),
});

export const deletePerformanceReviewSchema = z.object({
    id: z.uuid(),
});

export const listPerformanceReviewsByEmployeeSchema = z.object({
    employeeId: z.uuid(),
});

export const createPerformanceGoalSchema = z.object({
    reviewId: z.uuid(),
    description: z.string().trim().min(1).max(2000),
    targetDate: z.coerce.date(),
    status: performanceGoalStatusSchema.optional(),
    rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
    comments: z.string().max(5000).nullable().optional(),
});

export const updatePerformanceGoalSchema = z.object({
    goalId: z.uuid(),
    description: z.string().trim().min(1).max(2000).optional(),
    targetDate: z.coerce.date().optional(),
    status: performanceGoalStatusSchema.optional(),
    rating: z.coerce.number().int().min(1).max(5).nullable().optional(),
    comments: z.string().max(5000).nullable().optional(),
});

export const deletePerformanceGoalSchema = z.object({
    goalId: z.uuid(),
});

export const listPerformanceGoalsByReviewSchema = z.object({
    reviewId: z.uuid(),
});

export type CreatePerformanceReviewPayload = z.infer<typeof createPerformanceReviewSchema>;
export type UpdatePerformanceReviewPayload = z.infer<typeof updatePerformanceReviewSchema>;
export type GetPerformanceReviewPayload = z.infer<typeof getPerformanceReviewSchema>;
export type DeletePerformanceReviewPayload = z.infer<typeof deletePerformanceReviewSchema>;
export type ListPerformanceReviewsByEmployeePayload = z.infer<typeof listPerformanceReviewsByEmployeeSchema>;
export type CreatePerformanceGoalPayload = z.infer<typeof createPerformanceGoalSchema>;
export type UpdatePerformanceGoalPayload = z.infer<typeof updatePerformanceGoalSchema>;
export type DeletePerformanceGoalPayload = z.infer<typeof deletePerformanceGoalSchema>;
export type ListPerformanceGoalsByReviewPayload = z.infer<typeof listPerformanceGoalsByReviewSchema>;
