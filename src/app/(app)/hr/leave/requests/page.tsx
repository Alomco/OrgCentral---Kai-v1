import type { Metadata } from 'next';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { CalendarCheck, CalendarDays, RefreshCw } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HrPageHeader } from '../../_components/hr-page-header';
import { LeaveSubnav } from '../_components/leave-subnav';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { getHrSessionContextOrRedirect } from '@/server/ui/auth/hr-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getLeaveRequestsForUi } from '@/server/use-cases/hr/leave/get-leave-requests.cached';
import { LeaveRequestsPanel } from '../_components/leave-requests-panel';
import { parseLeaveApprovalMetadata } from '../lib/leave-approval-metadata';
import { refreshLeaveRequestsAction } from './actions';
import { buildLeaveRequestSummary } from './leave-request-summary';

export const metadata: Metadata = {
    title: 'Leave Requests',
    description: 'Review, track, and act on leave requests.',
};

export default async function HrLeaveRequestsPage() {
    const headerStore = await nextHeaders();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;

    const { authorization } = await getHrSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredAnyPermissions: [
                HR_PERMISSION_PROFILE.LEAVE_READ,
                HR_PERMISSION_PROFILE.PROFILE_READ,
            ],
            auditSource: 'ui:hr:leave:requests',
            correlationId,
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.LEAVE_REQUEST,
            resourceAttributes: {
                scope: 'requests',
                correlationId,
            },
        },
    );

    const peopleService = getPeopleService();
    const profileResult = await peopleService.getEmployeeProfileByUser({
        authorization,
        payload: { userId: authorization.userId },
    }).catch(() => null);

    const profile = profileResult?.profile ?? null;
    const employeeId = profile?.userId ?? null;

    const managerProfileResult = profile?.managerUserId
        ? await peopleService.getEmployeeProfileByUser({
            authorization,
            payload: { userId: profile.managerUserId },
        }).catch(() => null)
        : null;

    const approvalMeta = parseLeaveApprovalMetadata(profile?.metadata ?? null);
    const primaryApproverLabel = managerProfileResult?.profile?.displayName
        ? `${managerProfileResult.profile.displayName} (manager)`
        : profile?.managerUserId
            ? `Manager (${profile.managerUserId})`
            : 'Manager';

    const approverChain = {
        primary: primaryApproverLabel,
        fallback: approvalMeta.fallbackName ?? 'HR administrator',
        slaDays: approvalMeta.slaDays ?? 2,
        notes: approvalMeta.notes ?? 'Manager is primary approver; HR admin can act if manager is unavailable after SLA.',
    } as const;

    const requestResult = employeeId
        ? await getLeaveRequestsForUi({ authorization, employeeId })
            .catch(() => ({ requests: [] }))
        : { requests: [] };

    const summary = buildLeaveRequestSummary(requestResult.requests);

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/hr">HR</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/hr/leave">Leave</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Requests</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Leave requests"
                description="Track submissions, approvals, and SLA status in one place."
                icon={<CalendarCheck className="h-5 w-5" />}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <LeaveSubnav />
                <form action={refreshLeaveRequestsAction}>
                    <Button type="submit" variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Total requests" value={summary.total.toString()} />
                <SummaryCard label="Pending" value={summary.pending.toString()} />
                <SummaryCard label="Approved" value={summary.approved.toString()} />
                <SummaryCard label="Rejected" value={summary.rejected.toString()} />
            </div>

            {employeeId ? (
                <LeaveRequestsPanel
                    authorization={authorization}
                    employeeId={employeeId}
                    approverChain={approverChain}
                    title="Your leave requests"
                    description="Latest submissions and approvals across your leave calendar."
                    requests={requestResult.requests}
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Leave requests</CardTitle>
                        <CardDescription>
                            Your account is missing an employee profile. Ask your administrator to complete it before requesting leave.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href="/hr/profile">
                                <CalendarDays className="h-4 w-4" />
                                Go to profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className="border-border/60 bg-background/60">
            <CardHeader className="space-y-1">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}
