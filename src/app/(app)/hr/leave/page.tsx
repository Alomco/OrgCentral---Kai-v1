import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

import { HrPageHeader } from '../_components/hr-page-header';
import { buildInitialLeaveRequestFormState } from './form-state';
import { LeaveRequestForm } from './_components/leave-request-form';
import { LeaveRequestsPanel } from './_components/leave-requests-panel';
import { LeaveSubnav } from './_components/leave-subnav';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { getAbsences } from '@/server/use-cases/hr/absences/get-absences';
import { PrismaUnplannedAbsenceRepository } from '@/server/repositories/prisma/hr/absences';
import { TeamCalendarPeek } from './_components/team-calendar-peek';
import { LeaveTrendsCard } from './_components/leave-trends-card';
import { parseLeaveApprovalMetadata } from './lib/leave-approval-metadata';

function buildTodayDateInputValue(): string {
    return new Date().toISOString().slice(0, 10);
}

const LEAVE_ABSENCE_LOOKAHEAD_MS = 1000 * 60 * 60 * 24 * 21;

function buildAbsenceWindow(): { from: Date; to: Date } {
    const from = new Date();
    const to = new Date(from.getTime() + LEAVE_ABSENCE_LOOKAHEAD_MS);
    return { from, to };
}

function LeaveRequestsSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
}

export default async function HrLeavePage() {
    const headerStore = await nextHeaders();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;
    const { authorization } = await getSessionContextOrRedirect({}, {
        headers: headerStore,
        requiredAnyPermissions: [
            { [HR_RESOURCE.HR_LEAVE]: ['read'] },
            { employeeProfile: ['read'] },
        ],
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { scope: 'self', correlationId },
        auditSource: 'ui:hr:leave',
        correlationId,
    });

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

    if (!employeeId) {
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
                            <BreadcrumbPage>Leave management</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <HrPageHeader
                    title="Leave management"
                    description="We couldn't find an employee profile for your account."
                    icon={<CalendarDays className="h-5 w-5" />}
                />

                <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Ask your administrator to complete your employee profile before requesting leave.
                </div>
            </div>
        );
    }

    const initialState = buildInitialLeaveRequestFormState({
        leaveType: '',
        startDate: buildTodayDateInputValue(),
        endDate: '',
        totalDays: 1,
        isHalfDay: false,
        reason: '',
    });

    const leaveService = getLeaveService();
    const balancesResult = await leaveService.getLeaveBalance({
        authorization,
        employeeId: employeeId,
        year: new Date().getFullYear(),
    }).catch(() => ({ balances: [] }));

    const absencesRepo = new PrismaUnplannedAbsenceRepository();
    const { from: absencesFrom, to: absencesTo } = buildAbsenceWindow();
    const absencesResult = await getAbsences({ absenceRepository: absencesRepo }, {
        authorization,
        filters: {
            from: absencesFrom,
            to: absencesTo,
        },
    }).catch(() => ({ absences: [] }));

    const residencyText = authorization.dataResidency;
    const jurisdictionLabel = residencyText.toLowerCase().includes('sct')
        ? 'United Kingdom: Scotland'
        : residencyText.toLowerCase().includes('nir')
            ? 'United Kingdom: Northern Ireland'
            : 'United Kingdom: England & Wales';

    const policySummary = {
        jurisdiction: jurisdictionLabel,
        noticeRule: 'Give notice of at least 2x the length of leave (UK Gov guidance)',
        maxSpanDays: 28,
        bankHolidaySource: 'Gov.uk bank holidays (region-aware with static fallback)',
        dataResidency: authorization.dataResidency,
        dataClassification: authorization.dataClassification,
    } as const;

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
                        <BreadcrumbPage>Leave management</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Leave management"
                description={profile?.displayName
                    ? `Request and track leave for ${profile.displayName}.`
                    : 'Request leave, track submissions, and see who approves.'}
                icon={<CalendarDays className="h-5 w-5" />}
            />

            <LeaveSubnav />

            <div className="grid gap-6 lg:grid-cols-2">
                <LeaveRequestForm
                    initialState={initialState}
                    policySummary={policySummary}
                    balances={balancesResult.balances}
                />

                <Suspense fallback={<LeaveRequestsSkeleton />}>
                    <LeaveRequestsPanel authorization={authorization} employeeId={employeeId} approverChain={approverChain} />
                </Suspense>
            </div>

            <TeamCalendarPeek absences={absencesResult.absences} />

            <Suspense fallback={<LeaveRequestsSkeleton />}>
                <LeaveTrendsCard authorization={authorization} employeeId={employeeId} />
            </Suspense>
        </div>
    );
}
