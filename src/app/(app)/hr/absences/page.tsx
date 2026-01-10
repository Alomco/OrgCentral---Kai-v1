import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { UserX } from 'lucide-react';

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

import { HrPageHeader } from '../_components/hr-page-header';
import { HrCardSkeleton } from '../_components/hr-card-skeleton';
import { AbsenceListPanel } from './_components/absences-list-panel';
import { ReportAbsenceForm } from './_components/report-absence-form';
import { AbsenceApprovalPanel } from './_components/absence-approval-panel';
import { TeamAbsencePanel } from './_components/team-absence-panel';
import { AbsenceTrendsCard } from './_components/absence-trends-card';
import { buildInitialReportAbsenceFormState } from './form-state';
import { listAbsenceTypeConfigsForUi } from '@/server/use-cases/hr/absences/list-absence-type-configs.cached';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getAbsences } from '@/server/use-cases/hr/absences/get-absences';
import { PrismaUnplannedAbsenceRepository } from '@/server/repositories/prisma/hr/absences/prisma-unplanned-absence-repository';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export const metadata: Metadata = {
    title: 'Absences',
    description: 'Report unplanned absences and manage return-to-work flows.',
};

export default async function HrAbsencesPage() {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { employeeProfile: ['read'] },
            auditSource: 'ui:hr:absences',
        },
    );

    // Check for manager permissions
    const managerAuthorization = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:hr:absences:manager',
            action: 'list',
            resourceType: 'hr.absences',
            resourceAttributes: { view: 'team' },
        },
    )
        .then((result) => result.authorization)
        .catch(() => null);

    const isManager = managerAuthorization !== null;

    const initialFormState = buildInitialReportAbsenceFormState();
    const { types: absenceTypes } = await listAbsenceTypeConfigsForUi({
        authorization,
    });

    const managerPanels = isManager
        ? await buildManagerPanels(managerAuthorization, absenceTypes)
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
                        <BreadcrumbPage>Absences</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Absences"
                description="Report unplanned absences and manage return-to-work flows."
                icon={<UserX className="h-5 w-5" />}
            />

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

            {/* Manager Panels */}
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

async function buildManagerPanels(
    authorization: RepositoryAuthorizationContext,
    absenceTypes: { id: string; label: string }[],
): Promise<{
    pendingRequests: {
        id: string;
        employeeName: string;
        type: string;
        startDate: Date;
        endDate: Date;
        reason?: string;
        submittedAt: Date;
    }[];
    teamAbsences: {
        id: string;
        employeeId: string;
        employeeName: string;
        type: string;
        startDate: Date;
        endDate: Date;
        status: 'approved' | 'pending';
    }[];
    teamSize: number;
}> {
    const peopleService = getPeopleService();
    const profilesResult = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    }).catch(() => ({ profiles: [] }));

    const directReports = profilesResult.profiles.filter(
        (profile) => profile.managerUserId === authorization.userId,
    );
    const teamUserIds = new Set(directReports.map((profile) => profile.userId));
    const profileByUserId = new Map(
        directReports.map((profile) => [profile.userId, profile]),
    );
    const absenceTypeById = new Map(
        absenceTypes.map((type) => [type.id, type.label]),
    );

    const absenceRepository = new PrismaUnplannedAbsenceRepository();
    const today = new Date();
    const windowEnd = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30);

    const absencesResult = await getAbsences(
        { absenceRepository },
        {
            authorization,
            filters: {
                from: today,
                to: windowEnd,
            },
        },
    ).catch(() => ({ absences: [] }));

    const pendingRequests = absencesResult.absences
        .filter((absence) => absence.status === 'REPORTED' && teamUserIds.has(absence.userId))
        .map((absence) => {
            const profile = profileByUserId.get(absence.userId);
            const name = resolveProfileName(profile);
            return {
                id: absence.id,
                employeeName: name,
                type: absenceTypeById.get(absence.typeId) ?? absence.typeId,
                startDate: absence.startDate,
                endDate: absence.endDate,
                reason: absence.reason ?? undefined,
                submittedAt: absence.createdAt,
            };
        });

    const teamAbsences: {
        id: string;
        employeeId: string;
        employeeName: string;
        type: string;
        startDate: Date;
        endDate: Date;
        status: 'approved' | 'pending';
    }[] = absencesResult.absences
        .filter((absence) => teamUserIds.has(absence.userId))
        .filter((absence) => absence.status === 'APPROVED' || absence.status === 'REPORTED')
        .map((absence) => {
            const profile = profileByUserId.get(absence.userId);
            const name = resolveProfileName(profile);
            return {
                id: absence.id,
                employeeId: profile?.id ?? absence.userId,
                employeeName: name,
                type: absenceTypeById.get(absence.typeId) ?? absence.typeId,
                startDate: absence.startDate,
                endDate: absence.endDate,
                status: absence.status === 'APPROVED' ? 'approved' : 'pending',
            };
        });

    return {
        pendingRequests,
        teamAbsences,
        teamSize: directReports.length,
    };
}

function resolveProfileName(
    profile?: { displayName?: string | null; firstName?: string | null; lastName?: string | null },
): string {
    if (!profile) {
        return 'Employee';
    }
    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }
    const combined = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return combined.length > 0 ? combined : 'Employee';
}
