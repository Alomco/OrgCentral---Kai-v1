import { Suspense } from 'react';
import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import { FileText } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PoliciesTableClient } from './_components/policies-table.client';
import { PoliciesHeaderClient } from './_components/policies-header.client';
import { PoliciesFiltersClient } from './_components/policies-filters.client';
import { Skeleton } from '@/components/ui/skeleton';
import { listHrPoliciesForUi } from '@/server/use-cases/hr/policies/list-hr-policies.cached';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { getHrSessionContextOrRedirect, getOptionalHrAuthorization } from '@/server/ui/auth/hr-session';
import type { HRPolicyListItem } from '@/server/types/hr-ops-types';

import { HrPageHeader } from '../_components/hr-page-header';
import { PolicyAdminPanel } from './_components/policy-admin-panel';

function sortPoliciesByEffectiveDateDescending(policies: HRPolicyListItem[]): HRPolicyListItem[] {
    return policies.toSorted((left, right) => right.effectiveDate.getTime() - left.effectiveDate.getTime());
}

export default function HrPoliciesPage() {
    return (
        <Suspense fallback={<PoliciesPageSkeleton />}>
            <PoliciesPageContent />
        </Suspense>
    );
}

async function PoliciesPageContent() {
    const headerStore = await nextHeaders();
    const { authorization } = await getHrSessionContextOrRedirect({}, {
        headers: headerStore,
        requiredPermissions: HR_PERMISSION_PROFILE.POLICY_LIST,
        auditSource: 'ui:hr:policies:list',
        action: HR_ACTION.LIST,
        resourceType: HR_RESOURCE_TYPE.POLICY,
    });

    const policiesPromise = listHrPoliciesForUi({ authorization });
    const adminAuthorizationPromise = getOptionalHrAuthorization(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.POLICY_MANAGE,
            auditSource: 'ui:hr:policies:admin',
            action: HR_ACTION.MANAGE,
            resourceType: HR_RESOURCE_TYPE.POLICY,
            resourceAttributes: { view: 'admin' },
        },
    );

    const [{ policies }, adminAuthorization] = await Promise.all([
        policiesPromise,
        adminAuthorizationPromise,
    ]);
    const sortedPolicies = sortPoliciesByEffectiveDateDescending(policies);

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
                        <BreadcrumbPage>Policies</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <HrPageHeader
                    title="Policies"
                    description="Review and acknowledge organization policies."
                    icon={<FileText className="h-5 w-5" />}
                />
                <PoliciesHeaderClient orgId={authorization.orgId} />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <PoliciesFiltersClient />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All policies</CardTitle>
                    <CardDescription>Latest effective policies appear first.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PoliciesTableClient initial={sortedPolicies} orgId={authorization.orgId} />
                </CardContent>
            </Card>

            {adminAuthorization ? (
                <PolicyAdminPanel authorization={adminAuthorization} />
            ) : null}
        </div>
    );
}

function PoliciesPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Policies</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review and acknowledge organization policies.
                    </p>
                </div>
                <Skeleton className="h-6 w-24" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All policies</CardTitle>
                    <CardDescription>Latest effective policies appear first.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

