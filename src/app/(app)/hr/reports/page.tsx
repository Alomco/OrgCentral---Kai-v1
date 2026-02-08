import type { Metadata } from 'next';
import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import { AlertTriangle, BarChart3 } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HrPageHeader } from '../_components/hr-page-header';
import { ReportsContent } from './_components/reports-content';
import { buildReportsMetrics } from './reports-utils';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { getHrSessionContextOrRedirect } from '@/server/ui/auth/hr-session';
import { getEmployeeDirectoryStatsForUi } from '@/server/use-cases/hr/people/get-employee-directory-stats.cached';
import { getLeaveRequestsForUi } from '@/server/use-cases/hr/leave/get-leave-requests.cached';
import { getAbsencesForUi } from '@/server/use-cases/hr/absences/get-absences.cached';
import { getTimeEntriesForUi } from '@/server/use-cases/hr/time-tracking/get-time-entries.cached';
import { getTrainingRecordsForUi } from '@/server/use-cases/hr/training/get-training-records.cached';
import { listHrPoliciesForUi } from '@/server/use-cases/hr/policies/list-hr-policies.cached';
import { listComplianceItemsForOrgForUi } from '@/server/use-cases/hr/compliance/list-compliance-items-for-org.cached';
import { listDocumentsForUi } from '@/server/use-cases/records/documents/list-documents.cached';
import { appLogger } from '@/server/logging/structured-logger';

export const metadata: Metadata = {
    title: 'HR Reports',
    description: 'Cross-module HR analytics and reporting.',
};

export default async function HrReportsPage() {
    const headerStore = await nextHeaders();
    const { authorization } = await getHrSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.REPORTS_READ,
            auditSource: 'ui:hr:reports',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.REPORTS,
        },
    );

    const failedSources: string[] = [];
    const [
        employeeStatsResult,
        leaveResult,
        absencesResult,
        timeEntriesResult,
        trainingResult,
        policyResult,
        complianceResult,
        documentResult,
    ] = await Promise.all([
        getWithFallback({
            source: 'employee-directory-stats',
            orgId: authorization.orgId,
            failedSources,
            fallback: {
                total: 0,
                active: 0,
                onLeave: 0,
                newThisMonth: 0,
            },
            load: () => getEmployeeDirectoryStatsForUi({ authorization }),
        }),
        getWithFallback({
            source: 'leave-requests',
            orgId: authorization.orgId,
            failedSources,
            fallback: { requests: [] },
            load: () => getLeaveRequestsForUi({ authorization }),
        }),
        getWithFallback({
            source: 'absences',
            orgId: authorization.orgId,
            failedSources,
            fallback: { absences: [] },
            load: () => getAbsencesForUi({ authorization }),
        }),
        getWithFallback({
            source: 'time-entries',
            orgId: authorization.orgId,
            failedSources,
            fallback: { entries: [] },
            load: () => getTimeEntriesForUi({ authorization }),
        }),
        getWithFallback({
            source: 'training-records',
            orgId: authorization.orgId,
            failedSources,
            fallback: { records: [] },
            load: () => getTrainingRecordsForUi({ authorization }),
        }),
        getWithFallback({
            source: 'policies',
            orgId: authorization.orgId,
            failedSources,
            fallback: { policies: [] },
            load: () => listHrPoliciesForUi({ authorization }),
        }),
        getWithFallback({
            source: 'compliance-items',
            orgId: authorization.orgId,
            failedSources,
            fallback: { items: [] },
            load: () => listComplianceItemsForOrgForUi({ authorization }),
        }),
        getWithFallback({
            source: 'documents',
            orgId: authorization.orgId,
            failedSources,
            fallback: { documents: [] },
            load: () => listDocumentsForUi({ authorization }),
        }),
    ]);

    const uniqueFailedSources = Array.from(new Set(failedSources));
    if (uniqueFailedSources.length > 0) {
        appLogger.warn('hr.reports.partial-data', {
            orgId: authorization.orgId,
            failedSources: uniqueFailedSources,
        });
    }

    const employeeStats = employeeStatsResult;
    const leaveRequests = leaveResult.requests;
    const absences = absencesResult.absences;
    const timeEntries = timeEntriesResult.entries;
    const trainingRecords = trainingResult.records;
    const policies = policyResult.policies;
    const complianceItems = complianceResult.items;
    const documents = documentResult.documents;

    const metrics = buildReportsMetrics({
        employeeStats,
        leaveRequests,
        absences,
        timeEntries,
        trainingRecords,
        policies,
        complianceItems,
        documents,
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
                actions={(
                    <>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link href="/api/hr/reports/export?format=csv" download>
                                Export CSV
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link href="/api/hr/reports/export?format=pdf" download>
                                Export PDF
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                            <Link href="/api/hr/reports/export?format=json" download>
                                Export JSON
                            </Link>
                        </Button>
                    </>
                )}
            />
            {uniqueFailedSources.length > 0 ? (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Some report modules are temporarily unavailable</AlertTitle>
                    <AlertDescription>
                        Showing partial data. Unavailable sources: {uniqueFailedSources.join(', ')}.
                    </AlertDescription>
                </Alert>
            ) : null}
            <ReportsContent
                employeeStats={employeeStats}
                leaveRequests={leaveRequests}
                absences={absences}
                timeEntries={timeEntries}
                metrics={metrics}
            />
        </div>
    );
}

async function getWithFallback<TValue>({
    source,
    orgId,
    failedSources,
    fallback,
    load,
}: {
    source: string;
    orgId: string;
    failedSources: string[];
    fallback: TValue;
    load: () => Promise<TValue>;
}): Promise<TValue> {
    try {
        return await load();
    } catch (error) {
        failedSources.push(source);
        appLogger.warn('hr.reports.source-failed', {
            orgId,
            source,
            error: toErrorMessage(error),
        });
        return fallback;
    }
}

function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Unknown error';
}
