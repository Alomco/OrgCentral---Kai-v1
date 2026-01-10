import type { Metadata } from 'next';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { HrPageHeader } from '../../_components/hr-page-header';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { LeaveManagementHub } from "../_components/leave-management-hub";

export const metadata: Metadata = {
    title: 'Leave Management',
    description: 'Review and act on leave requests with filters and delegation.',
};

interface PageProps {
    searchParams?: Record<string, string | string[] | undefined>;
}

export default async function LeaveAdminPage({ searchParams }: PageProps) {
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:hr:admin:leave',
        },
    );

    const statusFilter = typeof searchParams?.status === 'string' ? (searchParams.status as 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'all') : 'submitted';
    const typeFilter = typeof searchParams?.type === 'string' ? searchParams.type : undefined;
    const employeeQuery = typeof searchParams?.employee === 'string' ? searchParams.employee : undefined;
    const departmentFilter = typeof searchParams?.department === 'string' ? searchParams.department : undefined;
    const dateFrom = typeof searchParams?.from === 'string' ? searchParams.from : undefined;
    const dateTo = typeof searchParams?.to === 'string' ? searchParams.to : undefined;
    const delegateFor = typeof searchParams?.delegateFor === 'string' ? searchParams.delegateFor : undefined;

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
                            <Link href="/hr/admin">Admin</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Leave</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Leave management"
                description="Review requests, apply filters, and delegate approvals."
                icon={<ShieldCheck className="h-5 w-5" />}
            />

            <LeaveManagementHub
                authorization={authorization}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                employeeQuery={employeeQuery}
                departmentFilter={departmentFilter}
                dateFrom={dateFrom}
                dateTo={dateTo}
                delegateFor={delegateFor}
                searchParams={searchParams}
            />
        </div>
    );
}
