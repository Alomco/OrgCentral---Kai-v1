import type { Metadata } from 'next';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HrPageHeader } from '../../_components/hr-page-header';
import { LeaveSubnav } from '../_components/leave-subnav';
import { LeavePolicyConfigPanel } from '../../settings/_components/leave-policy-config-panel';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { getHrSessionContextOrRedirect } from '@/server/ui/auth/hr-session';

export const metadata: Metadata = {
    title: 'Leave Policies',
    description: 'Create, review, and maintain leave policies and accrual rules.',
};

export default async function HrLeavePoliciesPage() {
    const headerStore = await nextHeaders();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;

    const { authorization } = await getHrSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.LEAVE_POLICY_MANAGE,
            auditSource: 'ui:hr:leave:policies',
            correlationId,
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.LEAVE_POLICY,
            resourceAttributes: {
                scope: 'policies',
                correlationId,
            },
        },
    );

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
                        <BreadcrumbPage>Policies</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Leave policies"
                description="Create policies, tune accrual rules, and keep compliance aligned."
                icon={<ClipboardList className="h-5 w-5" />}
            />

            <LeaveSubnav />

            <Card>
                <CardHeader>
                    <CardTitle>Policy details</CardTitle>
                    <CardDescription>Defaults control how new balances are created.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Set one default policy for new hires. Accrual values determine annual entitlements and
                    immediately affect new balance calculations.
                </CardContent>
            </Card>

            <LeavePolicyConfigPanel authorization={authorization} showPageLink={false} />
        </div>
    );
}
