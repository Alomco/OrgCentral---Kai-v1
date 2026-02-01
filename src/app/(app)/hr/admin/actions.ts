'use server';

import { cache } from 'react';
import { headers as nextHeaders } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listPendingReviewComplianceItemsForUi } from '@/server/use-cases/hr/compliance/list-pending-review-items.cached';
import { listComplianceItemsForOrgForUi } from '@/server/use-cases/hr/compliance/list-compliance-items-for-org.cached';
import { getLeaveRequestsForUi } from '@/server/use-cases/hr/leave/get-leave-requests.cached';
import { getAbsencesForUi } from '@/server/use-cases/hr/absences/get-absences.cached';
import { getTimeEntriesForUi } from '@/server/use-cases/hr/time-tracking/get-time-entries.cached';
import { listEmployeeProfilesForUi } from '@/server/use-cases/hr/people/list-employee-profiles.cached';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { createLruCache } from '@/server/lib/lru-cache';
import type { AdminDashboardStats, PendingApprovalItem } from './actions.types';

const adminStatsCache = createLruCache<string, AdminDashboardStats>({ maxEntries: 50, ttlMs: 30_000 });

function canCacheAdminStats(dataClassification: string): boolean {
    return dataClassification === 'OFFICIAL';
}

/**
 * Fetch admin dashboard statistics
 */
export const getAdminDashboardStats = cache(async (): Promise<AdminDashboardStats> => {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'action:hr:admin:stats',
        },
    );

    const cacheKey = `org:${authorization.tenantScope.orgId}`;
    const shouldCache = canCacheAdminStats(authorization.tenantScope.dataClassification);
    if (shouldCache) {
        const cached = adminStatsCache.get(cacheKey);
        if (cached) {
            return cached;
        }
    }

    const stats: AdminDashboardStats = {
        totalEmployees: 0,
        activeEmployees: 0,
        pendingLeaveRequests: 0,
        complianceAlerts: 0,
        upcomingExpirations: 0,
        newHiresThisMonth: 0,
    };

    try {
        // Get employee counts
        const peopleService = getPeopleService();
        const result = await peopleService.listEmployeeProfiles({
            authorization,
            payload: {},
        });

        stats.totalEmployees = result.profiles.length;
        stats.activeEmployees = result.profiles.filter(
            (p) => p.employmentStatus === 'ACTIVE',
        ).length;

        // Count new hires this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        stats.newHiresThisMonth = result.profiles.filter((p) => {
            if (!p.startDate) { return false; }
            const startDate = p.startDate instanceof Date ? p.startDate : new Date(p.startDate);
            return startDate >= startOfMonth;
        }).length;
    } catch {
        // Gracefully handle permission errors
    }

    const [leaveResult, complianceResult, complianceItemsResult] = await Promise.all([
        getLeaveRequestsForUi({ authorization }).catch(() => ({ requests: [] })),
        listPendingReviewComplianceItemsForUi({ authorization, take: 500 }).catch(() => ({ items: [] })),
        listComplianceItemsForOrgForUi({ authorization, take: 2000 }).catch(() => ({ items: [] })),
    ]);

    stats.pendingLeaveRequests = leaveResult.requests.filter((request) => request.status === 'submitted').length;
    stats.complianceAlerts = complianceResult.items.length;
    const now = new Date();
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    stats.upcomingExpirations = complianceItemsResult.items.filter((item) => {
        if (!item.dueDate) {
            return false;
        }
        return item.dueDate >= now && item.dueDate <= next30;
    }).length;

    if (shouldCache) {
        adminStatsCache.set(cacheKey, stats);
    }

    return stats;
});

/**
 * Fetch pending approval items for HR admin
 */
export const getPendingApprovals = cache(async (): Promise<PendingApprovalItem[]> => {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'action:hr:admin:pending-approvals',
        },
    );

    const [leaveResult, complianceResult, absencesResult, timeEntriesResult, profilesResult] = await Promise.all([
        getLeaveRequestsForUi({ authorization }).catch(() => ({ requests: [] })),
        listPendingReviewComplianceItemsForUi({ authorization, take: 20 }).catch(() => ({ items: [] })),
        getAbsencesForUi({ authorization, includeClosed: false }).catch(() => ({ absences: [] })),
        getTimeEntriesForUi({ authorization }).catch(() => ({ entries: [] })),
        listEmployeeProfilesForUi({ authorization }).catch(() => ({ profiles: [] })),
    ]);

    const profileLookup = new Map(
        profilesResult.profiles.map((profile) => [profile.userId, profile] as const),
    );

    const leaveItems: PendingApprovalItem[] = leaveResult.requests
        .filter((request) => request.status === 'submitted')
        .slice(0, 10)
        .map((request) => ({
            id: request.id,
            type: 'leave',
            title: `Leave request • ${request.leaveType}`,
            description: request.reason ?? 'Leave request submitted.',
            submittedAt: new Date(request.createdAt),
            submittedBy: request.employeeName,
        }));

    const complianceItems: PendingApprovalItem[] = complianceResult.items.map((item) => ({
        id: item.id,
        type: 'compliance',
        title: 'Compliance review pending',
        description: item.templateItemId,
        submittedAt: item.updatedAt,
        submittedBy: profileLookup.get(item.userId)?.displayName ?? item.userId,
    }));

    const absenceItems: PendingApprovalItem[] = absencesResult.absences
        .filter((absence) => absence.status === 'REPORTED')
        .slice(0, 10)
        .map((absence) => ({
            id: absence.id,
            type: 'absence',
            title: 'Absence reported',
            description: absence.reason ?? 'Awaiting acknowledgment.',
            submittedAt: absence.createdAt,
            submittedBy: profileLookup.get(absence.userId)?.displayName ?? absence.userId,
        }));

    const timeEntries: PendingApprovalItem[] = timeEntriesResult.entries
        .filter((entry) => entry.status === 'COMPLETED')
        .slice(0, 10)
        .map((entry) => ({
            id: entry.id,
            type: 'time-entry',
            title: 'Time entry pending approval',
            description: entry.project ?? 'Timesheet submitted.',
            submittedAt: entry.updatedAt,
            submittedBy: profileLookup.get(entry.userId)?.displayName ?? entry.userId,
        }));

    return [...leaveItems, ...complianceItems, ...absenceItems, ...timeEntries]
        .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
        .slice(0, 20);
});
