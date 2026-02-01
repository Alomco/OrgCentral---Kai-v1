import type { ComplianceItemStatus } from '@/server/types/compliance-types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import { registerComplianceItemsCache } from './shared/cache-helpers';

const DAY_MS = 1000 * 60 * 60 * 24;

export interface ComplianceAnalyticsInput {
    authorization: RepositoryAuthorizationContext;
    take?: number;
    now?: Date;
}

export interface ComplianceAnalyticsDependencies {
    complianceItemRepository: IComplianceItemRepository;
}

export interface ComplianceAnalyticsSnapshot {
    total: number;
    byStatus: Record<ComplianceItemStatus, number>;
    overdue: number;
    expiringSoon: number;
    completedLast30: number;
    completedPrev30: number;
}

export interface ComplianceAnalyticsResult {
    snapshot: ComplianceAnalyticsSnapshot;
}

function initStatusCounts(): Record<ComplianceItemStatus, number> {
    return {
        PENDING: 0,
        COMPLETE: 0,
        MISSING: 0,
        PENDING_REVIEW: 0,
        NOT_APPLICABLE: 0,
        EXPIRED: 0,
    };
}

function isWithin(date: Date | null, from: Date, to: Date): boolean {
    if (!date) {
        return false;
    }
    return date >= from && date <= to;
}

export async function getComplianceAnalytics(
    deps: ComplianceAnalyticsDependencies,
    input: ComplianceAnalyticsInput,
): Promise<ComplianceAnalyticsResult> {
    registerComplianceItemsCache(input.authorization);

    const now = input.now ?? new Date();
    const last30 = new Date(now.getTime() - 30 * DAY_MS);
    const previous30 = new Date(now.getTime() - 60 * DAY_MS);

    const items = await deps.complianceItemRepository.listItemsForOrg(
        input.authorization.orgId,
        input.take,
    );

    const statusCounts = initStatusCounts();
    let overdue = 0;
    let expiringSoon = 0;
    let completedLast30 = 0;
    let completedPrevious30 = 0;

    for (const item of items) {
        statusCounts[item.status] += 1;

        if (item.dueDate) {
            if (item.dueDate < now && item.status !== 'COMPLETE') {
                overdue += 1;
            }
            if (item.dueDate >= now && item.dueDate <= new Date(now.getTime() + 30 * DAY_MS)) {
                expiringSoon += 1;
            }
        }

        const completedAt = item.completedAt ?? null;
        if (completedAt) {
            if (isWithin(completedAt, last30, now)) {
                completedLast30 += 1;
            } else if (isWithin(completedAt, previous30, last30)) {
                completedPrevious30 += 1;
            }
        }
    }

    return {
        snapshot: {
            total: items.length,
            byStatus: statusCounts,
            overdue,
            expiringSoon,
            completedLast30,
            completedPrev30: completedPrevious30,
        },
    };
}
