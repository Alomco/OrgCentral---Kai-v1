import type { Metadata } from 'next';
import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import {
    BarChart3,
    CalendarClock,
    ClipboardCheck,
    GraduationCap,
    ScrollText,
    Timer,
    Users,
} from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HrPageHeader } from '../_components/hr-page-header';
import { HrSection } from '../_components/hr-design-system/section';
import { HrStatCard } from '../_components/hr-design-system/stat-card';
import { StatusBreakdownCard } from './_components/status-breakdown-card';
import { buildReportsMetrics, formatCount } from './reports-utils';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getEmployeeDirectoryStatsForUi } from '@/server/use-cases/hr/people/get-employee-directory-stats.cached';
import { getLeaveRequestsForUi } from '@/server/use-cases/hr/leave/get-leave-requests.cached';
import { getAbsencesForUi } from '@/server/use-cases/hr/absences/get-absences.cached';
import { getTimeEntriesForUi } from '@/server/use-cases/hr/time-tracking/get-time-entries.cached';
import { getTrainingRecordsForUi } from '@/server/use-cases/hr/training/get-training-records.cached';
import { listHrPoliciesForUi } from '@/server/use-cases/hr/policies/list-hr-policies.cached';

export const metadata: Metadata = {
    title: 'HR Reports',
    description: 'Cross-module HR analytics and reporting.',
};

export default async function HrReportsPage() {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:hr:reports',
        },
    );

    const [
        employeeStatsResult,
        leaveResult,
        absencesResult,
        timeEntriesResult,
        trainingResult,
        policyResult,
    ] = await Promise.all([
        getEmployeeDirectoryStatsForUi({ authorization }).catch(() => ({
            total: 0,
            active: 0,
            onLeave: 0,
            newThisMonth: 0,
        })),
        getLeaveRequestsForUi({ authorization }).catch(() => ({ requests: [] })),
        getAbsencesForUi({ authorization }).catch(() => ({ absences: [] })),
        getTimeEntriesForUi({ authorization }).catch(() => ({ entries: [] })),
        getTrainingRecordsForUi({ authorization }).catch(() => ({ records: [] })),
        listHrPoliciesForUi({ authorization }).catch(() => ({ policies: [] })),
    ]);

    const employeeStats = employeeStatsResult;
    const leaveRequests = leaveResult.requests;
    const absences = absencesResult.absences;
    const timeEntries = timeEntriesResult.entries;
    const trainingRecords = trainingResult.records;
    const policies = policyResult.policies;

    const metrics = buildReportsMetrics({
        employeeStats,
        leaveRequests,
        absences,
        timeEntries,
        trainingRecords,
        policies,
    });

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
                        <BreadcrumbPage>Reports</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="HR reports"
                description="Cross-module KPIs for workforce, time off, time tracking, and learning."
                icon={<BarChart3 className="h-5 w-5" />}
            />

            <HrSection
                title="Organization pulse"
                description="Quick look at headcount, approvals, and activity volume."
                icon={<Users className="h-4 w-4" />}
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <HrStatCard
                        label="Active employees"
                        value={formatCount(employeeStats.active)}
                        icon={<Users className="h-5 w-5" />}
                        accentColor="primary"
                    />
                    <HrStatCard
                        label="Pending approvals"
                        value={formatCount(metrics.pendingApprovals)}
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        accentColor="warning"
                    />
                    <HrStatCard
                        label="Upcoming leave (30d)"
                        value={formatCount(metrics.leaveUpcoming)}
                        icon={<CalendarClock className="h-5 w-5" />}
                        accentColor="accent"
                    />
                    <HrStatCard
                        label="Open absences"
                        value={formatCount(metrics.absencesOpen)}
                        icon={<CalendarClock className="h-5 w-5" />}
                        accentColor="warning"
                    />
                    <HrStatCard
                        label="Hours logged (30d)"
                        value={formatCount(Math.round(metrics.totalHoursRecent))}
                        icon={<Timer className="h-5 w-5" />}
                        accentColor="success"
                    />
                    <HrStatCard
                        label="Training due soon"
                        value={formatCount(metrics.trainingDueSoon)}
                        icon={<GraduationCap className="h-5 w-5" />}
                        accentColor="accent"
                    />
                </div>
            </HrSection>

            <HrSection
                title="Approval pipeline"
                description="Pending items that require review across modules."
                icon={<ClipboardCheck className="h-4 w-4" />}
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    <StatusBreakdownCard
                        title="Leave requests"
                        description="Submitted and approved requests."
                        total={leaveRequests.length}
                        rows={[
                            { label: 'Submitted', count: metrics.leaveSubmitted, tone: 'warning' },
                            { label: 'Approved', count: metrics.leaveApproved, tone: 'success' },
                        ]}
                    />
                    <StatusBreakdownCard
                        title="Absences"
                        description="Reported and approved absences."
                        total={absences.length}
                        rows={[
                            { label: 'Reported', count: metrics.absencesReported, tone: 'warning' },
                            { label: 'Approved', count: metrics.absencesApproved, tone: 'success' },
                        ]}
                    />
                    <StatusBreakdownCard
                        title="Time entries"
                        description="Completed and approved timesheets."
                        total={timeEntries.length}
                        rows={[
                            { label: 'Pending approval', count: metrics.timeEntriesPending, tone: 'warning' },
                            { label: 'Approved', count: metrics.timeEntriesApproved, tone: 'success' },
                        ]}
                    />
                </div>
            </HrSection>

            <HrSection
                title="Learning and policy coverage"
                description="Training progress and active policy inventory."
                icon={<GraduationCap className="h-4 w-4" />}
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <GraduationCap className="h-4 w-4" />
                                Training status
                            </CardTitle>
                            <CardDescription>Track completion and in-progress enrollments.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary">{formatCount(metrics.trainingCompleted)} completed</Badge>
                                <Badge variant="outline">{formatCount(metrics.trainingInProgress)} in progress</Badge>
                                <Badge variant="outline">{formatCount(metrics.trainingDueSoon)} expiring soon</Badge>
                            </div>
                            <Separator />
                            <div className="text-sm text-muted-foreground">
                                Training activity is based on enrollments captured in the HR training module.
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ScrollText className="h-4 w-4" />
                                Policy library
                            </CardTitle>
                            <CardDescription>Active HR policies tracked for the organization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-semibold">{formatCount(metrics.policyCount)}</div>
                            <p className="text-sm text-muted-foreground">
                                Keep policy acknowledgments current for compliance readiness.
                            </p>
                            <Link href="/hr/policies" className="text-sm font-medium text-primary">
                                View policies
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </HrSection>
        </div>
    );
}
