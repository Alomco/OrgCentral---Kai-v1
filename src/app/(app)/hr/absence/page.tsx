import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { RefreshCw, UserX } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    HR_ACTION,
    HR_ANY_PERMISSION_PROFILE,
    HR_PERMISSION_PROFILE,
    HR_RESOURCE_TYPE,
} from '@/server/security/authorization';
import { getHrSessionContextOrRedirect, getOptionalHrAuthorization } from '@/server/ui/auth/hr-session';
import { listAbsenceTypeConfigsForUi } from '@/server/use-cases/hr/absences/list-absence-type-configs.cached';

import { HrPageHeader } from '../_components/hr-page-header';
import { HrCardSkeleton } from '../_components/hr-card-skeleton';
import { AbsenceListPanel } from './_components/absences-list-panel';
import { ReportAbsenceForm } from './_components/report-absence-form';
import { AbsenceApprovalPanel } from './_components/absence-approval-panel';
import { TeamAbsencePanel } from './_components/team-absence-panel';
import { AbsenceTrendsCard } from './_components/absence-trends-card';
import { AbsenceSubnav } from './_components/absence-subnav';
import { AbsenceBalanceCards } from './_components/absence-balance-cards';
import { buildInitialReportAbsenceFormState } from './form-state';
import { buildAbsenceManagerPanels } from './absence-manager-panels';
import { refreshAbsenceOverviewAction } from './actions';

export const metadata: Metadata = {
    title: 'Absence Overview',
    description: 'Report unplanned absences and monitor return-to-work workflows.',
};

export default async function HrAbsencePage() {
    const headerStore = await nextHeaders();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;

    const { authorization } = await getHrSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.ABSENCE_READ,
            auditSource: 'ui:hr:absence',
            correlationId,
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.ABSENCE,
            resourceAttributes: {
                scope: 'overview',
                correlationId,
            },
        },
    );

    const managerAuthorization = await getOptionalHrAuthorization(
        {},
        {
            headers: headerStore,
            requiredAnyPermissions: HR_ANY_PERMISSION_PROFILE.ABSENCE_MANAGEMENT,
            auditSource: 'ui:hr:absence:manager',
            correlationId,
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.ABSENCE,
            resourceAttributes: { view: 'team', correlationId },
        },
    );

    const isManager = managerAuthorization !== null;

    const initialFormState = buildInitialReportAbsenceFormState();
    const { types: absenceTypes } = await listAbsenceTypeConfigsForUi({
        authorization,
    });

    const managerPanels = isManager
        ? await buildAbsenceManagerPanels(managerAuthorization, absenceTypes)
        : null;

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
                        <BreadcrumbPage>Absence</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Absence overview"
                description="Report unplanned absences and track active requests."
                icon={<UserX className="h-5 w-5" />}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <AbsenceSubnav />
                <form action={refreshAbsenceOverviewAction}>
                    <Button type="submit" variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </form>
            </div>

            <Suspense fallback={<HrCardSkeleton variant="table" />}>
                <AbsenceBalanceCards authorization={authorization} absenceTypes={absenceTypes} />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
                <ReportAbsenceForm
                    authorization={authorization}
                    initialState={initialFormState}
                    absenceTypes={absenceTypes}
                />

                <Suspense fallback={<HrCardSkeleton variant="table" />}>
                    <AbsenceListPanel
                        authorization={authorization}
                        userId={authorization.userId}
                    />
                </Suspense>
            </div>

            <Suspense fallback={<HrCardSkeleton variant="form" />}>
                <AbsenceTrendsCard authorization={authorization} absenceTypes={absenceTypes} />
            </Suspense>

            {isManager ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    <AbsenceApprovalPanel
                        authorization={managerAuthorization}
                        pendingRequests={managerPanels?.pendingRequests ?? []}
                    />
                    <TeamAbsencePanel
                        teamAbsences={managerPanels?.teamAbsences ?? []}
                        teamSize={managerPanels?.teamSize ?? 0}
                    />
                </div>
            ) : null}
        </div>
    );
}
