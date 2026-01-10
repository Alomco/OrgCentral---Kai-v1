import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { Clock } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

import { HrPageHeader } from '../_components/hr-page-header';
import { HrCardSkeleton } from '../_components/hr-card-skeleton';
import { TimeEntriesPanel } from './_components/time-entries-panel';
import { CreateTimeEntryForm } from './_components/create-time-entry-form';
import { buildInitialTimeEntryFormState } from './form-state';
import { TimeEntryApprovalPanel, type PendingTimeEntry } from './_components/time-entry-approval-panel';

export default async function HrTimeTrackingPage() {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { employeeProfile: ['read'] },
            auditSource: 'ui:hr:time-tracking',
        },
    );

    const managerAuthorization = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:hr:time-tracking:manager',
            action: 'list',
            resourceType: 'hr.time-entry',
            resourceAttributes: { view: 'team' },
        },
    )
        .then((result) => result.authorization)
        .catch(() => null);

    const initialFormState = buildInitialTimeEntryFormState();
    const pendingEntries = managerAuthorization
        ? await buildPendingTimeEntries(managerAuthorization)
        : [];

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
                        <BreadcrumbPage>Time Tracking</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Time Tracking"
                description="Log your working hours and track time across projects."
                icon={<Clock className="h-5 w-5" />}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <CreateTimeEntryForm
                    authorization={authorization}
                    initialState={initialFormState}
                />

                <Suspense fallback={<HrCardSkeleton variant="table" />}>
                    <TimeEntriesPanel
                        authorization={authorization}
                        userId={authorization.userId}
                    />
                </Suspense>
            </div>

            {managerAuthorization ? (
                <TimeEntryApprovalPanel authorization={managerAuthorization} entries={pendingEntries} />
            ) : null}
        </div>
    );
}

async function buildPendingTimeEntries(
    authorization: RepositoryAuthorizationContext,
): Promise<PendingTimeEntry[]> {
    const peopleService = getPeopleService();
    const profilesResult = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    }).catch(() => ({ profiles: [] }));

    const directReports = profilesResult.profiles.filter(
        (profile) => profile.managerUserId === authorization.userId,
    );
    if (directReports.length === 0) {
        return [];
    }

    const profileByUserId = new Map(
        directReports.map((profile) => [profile.userId, profile]),
    );

    const timeTrackingService = getTimeTrackingService();
    const entriesResult = await timeTrackingService.listTimeEntries({
        authorization,
        filters: { status: 'COMPLETED' },
    }).catch(() => ({ entries: [] }));

    return entriesResult.entries
        .filter((entry) => profileByUserId.has(entry.userId))
        .map((entry) => {
            const profile = profileByUserId.get(entry.userId);
            const name = resolveProfileName(profile);

            return {
                id: entry.id,
                employeeName: name,
                date: entry.date,
                clockIn: entry.clockIn,
                clockOut: entry.clockOut,
                totalHours: resolveTotalHours(entry.totalHours),
                project: entry.project,
            };
        });
}

function resolveProfileName(profile?: {
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}): string {
    if (!profile) {
        return 'Employee';
    }
    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }
    const firstName = profile.firstName?.trim() ?? '';
    const lastName = profile.lastName?.trim() ?? '';
    const fallback = `${firstName} ${lastName}`.trim();
    return fallback.length > 0 ? fallback : 'Employee';
}

function resolveTotalHours(
    value: number | { toNumber?: () => number } | null | undefined,
): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'object' && typeof value.toNumber === 'function') {
        return value.toNumber();
    }
    return null;
}

