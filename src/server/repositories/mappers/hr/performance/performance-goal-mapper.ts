import type { PerformanceGoal } from '@/server/domain/hr/performance/types';
import type { Prisma } from '@prisma/client';

type PrismaPerformanceGoalRecord = Prisma.PerformanceGoalGetPayload<Record<string, never>>;

export function mapPrismaPerformanceGoalToDomain(record: PrismaPerformanceGoalRecord): PerformanceGoal {
    return {
        id: record.id,
        orgId: record.orgId,
        reviewId: record.reviewId,
        description: record.description,
        targetDate: record.targetDate,
        status: record.status as PerformanceGoal['status'],
        rating: record.rating ?? null,
        comments: record.comments ?? null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
