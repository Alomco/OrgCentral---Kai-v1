import { CalendarCheck } from 'lucide-react';

import { DashboardWidgetCard } from '../dashboard-widget-card';
import type { DashboardViewerContext } from '../dashboard-viewer-context';
import { requireSessionAuthorization } from '@/server/security/authorization';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveRequest, LeaveStatus } from '@/server/types/leave-types';
import { hasPermission } from '@/lib/security/permission-check';

function isLeaveStatusIncluded(status: LeaveStatus, allowed: readonly LeaveStatus[]): boolean {
    return allowed.includes(status);
}

function isWithinWindow(startDate: Date, now: Date, windowEnd: Date): boolean {
    return startDate.getTime() >= now.getTime() && startDate.getTime() <= windowEnd.getTime();
}

function countUpcomingRequests(requests: LeaveRequest[], now: Date, windowEnd: Date, allowedStatuses: readonly LeaveStatus[]): number {
    return requests.filter((request) => {
        if (!isLeaveStatusIncluded(request.status, allowedStatuses)) {
            return false;
        }

        const start = new Date(request.startDate);
        if (Number.isNaN(start.getTime())) {
            return false;
        }

        return isWithinWindow(start, now, windowEnd);
    }).length;
}

async function loadLeaveRequests(params: {
    authorization: RepositoryAuthorizationContext;
    isAdmin: boolean;
    userId: string;
    startDate: Date;
}): Promise<LeaveRequest[] | null> {
    const leaveService = getLeaveService();

    const result = params.isAdmin
        ? await leaveService.listLeaveRequests({
            authorization: params.authorization,
            filters: { status: 'submitted', startDate: params.startDate },
        })
        : await leaveService.listLeaveRequests({
            authorization: params.authorization,
            employeeId: params.userId,
            filters: { startDate: params.startDate },
        });

    return result.requests;
}

export async function LeaveWidget(props: DashboardViewerContext) {
    const isAdmin = hasPermission(props.baseAuthorization.permissions, 'organization', 'update');
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + 7);
    const title = isAdmin ? 'Leave requests' : 'Upcoming leave';
    const ctaLabel = isAdmin ? 'Manage leave' : 'View leave';
    const description = isAdmin ? 'Requests needing review.' : 'Your upcoming requests.';

    const authorization = await requireSessionAuthorization(props.session, {
        orgId: props.baseAuthorization.orgId,
        requiredPermissions: isAdmin
            ? { organization: ['update'] }
            : { organization: ['read'] },
        auditSource: 'ui:dashboard:leave',
        correlationId: props.baseAuthorization.correlationId,
        action: 'read',
        resourceType: 'hr.leave',
        resourceAttributes: {
            scope: isAdmin ? 'org' : 'self',
            targetUserId: isAdmin ? null : props.baseAuthorization.userId,
            windowDays: 7,
        },
    }).catch(() => null);

    if (!authorization) {
        return (
            <DashboardWidgetCard
                title={title}
                description={description}
                icon={CalendarCheck}
                href="/hr/leave"
                ctaLabel={ctaLabel}
                state="locked"
                statusLabel={isAdmin ? 'Admin only' : 'Restricted'}
                footerHint="You do not have access to leave data."
            />
        );
    }

    const allowedStatuses: readonly LeaveStatus[] = isAdmin ? ['submitted'] : ['submitted', 'approved'];
    const requests = await loadLeaveRequests({
        authorization,
        isAdmin,
        userId: props.baseAuthorization.userId,
        startDate: now,
    }).catch(() => null);

    if (!requests) {
        return (
            <DashboardWidgetCard
                title={title}
                description={description}
                icon={CalendarCheck}
                href="/hr/leave"
                ctaLabel={ctaLabel}
                state="error"
                footerHint="Unable to load leave requests right now."
            />
        );
    }

    const upcomingCount = countUpcomingRequests(requests, now, windowEnd, allowedStatuses);

    return (
        <DashboardWidgetCard
            title={title}
            description={isAdmin ? 'Submitted requests in the next 7 days.' : 'Starts in the next 7 days.'}
            icon={CalendarCheck}
            value={String(upcomingCount)}
            href="/hr/leave"
            ctaLabel={ctaLabel}
            footerHint={isAdmin ? 'Counts submitted requests starting soon.' : 'Counts your submitted/approved leave.'}
        />
    );
}
