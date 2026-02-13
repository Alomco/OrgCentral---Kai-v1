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
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { getHrSessionContextOrRedirect, getOptionalHrAuthorization } from '@/server/ui/auth/hr-session';
import { HrPageHeader } from '../_components/hr-page-header';
import { HrCardSkeleton } from '../_components/hr-card-skeleton';
import { TimeEntriesPanel } from './_components/time-entries-panel';
import { CreateTimeEntryForm } from './_components/create-time-entry-form';
import { buildInitialTimeEntryFormState } from './form-state';
import { TimeEntryApprovalPanel } from './_components/time-entry-approval-panel';
import { buildPendingTimeEntries } from './pending-entries';
import { buildTeamTimeEntries } from './team-entries';
import { TeamTimeEntriesPanel } from './_components/team-time-entries-panel';

export default async function HrTimeTrackingPage() {
    const headerStore = await nextHeaders();
    const approvalAuthorizationPromise = getOptionalHrAuthorization(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_APPROVE,
            auditSource: 'ui:hr:time-tracking:approval',
            action: HR_ACTION.APPROVE,
            resourceType: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceAttributes: { view: 'team' },
        },
    );
    const teamAuthorizationPromise = getOptionalHrAuthorization(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_MANAGE,
            auditSource: 'ui:hr:time-tracking:team',
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.TIME_ENTRY,
            resourceAttributes: { view: 'team' },
        },
    );
    const { authorization } = await getHrSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_LIST,
            auditSource: 'ui:hr:time-tracking',
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.TIME_ENTRY,
        },
    );
    const [approvalAuthorization, teamAuthorization] = await Promise.all([
        approvalAuthorizationPromise,
        teamAuthorizationPromise,
    ]);

    const initialFormState = buildInitialTimeEntryFormState();
    const pendingEntries = approvalAuthorization
        ? await buildPendingTimeEntries(approvalAuthorization)
        : [];
    const teamEntries = teamAuthorization
        ? await buildTeamTimeEntries(teamAuthorization)
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
                    initialState={initialFormState}
                />

                <Suspense fallback={<HrCardSkeleton variant="table" />}>
                    <TimeEntriesPanel
                        authorization={authorization}
                        userId={authorization.userId}
                    />
                </Suspense>
            </div>

            {teamAuthorization ? (
                <TeamTimeEntriesPanel entries={teamEntries} />
            ) : null}

            {approvalAuthorization ? (
                <TimeEntryApprovalPanel entries={pendingEntries} />
            ) : null}
        </div>
    );
}

