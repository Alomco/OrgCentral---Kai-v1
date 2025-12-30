import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'HR Administration',
    description: 'Manage employees, compliance, and HR operations.',
};
import { ShieldCheck } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';

import { HrPageHeader } from '../_components/hr-page-header';
import {
    HrAdminStatsRow,
    HrAdminAlerts,
    HrAdminQuickActions,
    HrAdminPendingItems,
} from './_components';
import { getAdminDashboardStats, getPendingApprovals } from './actions';

export default async function HrAdminPage() {
    const headerStore = await nextHeaders();
    await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:hr:admin',
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
                        <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="HR Administration"
                description="Manage employees, compliance, and HR operations"
                icon={<ShieldCheck className="h-5 w-5" />}
            />

            {/* Stats Overview */}
            <Suspense fallback={<StatsRowSkeleton />}>
                <StatsRow />
            </Suspense>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <HrAdminQuickActions />

                {/* Alerts Panel */}
                <Suspense fallback={<CardSkeleton />}>
                    <AlertsPanel />
                </Suspense>
            </div>

            {/* Pending Approvals */}
            <Suspense fallback={<CardSkeleton />}>
                <PendingItemsPanel />
            </Suspense>
        </div>
    );
}

async function StatsRow() {
    const stats = await getAdminDashboardStats();
    return <HrAdminStatsRow stats={stats} />;
}

async function AlertsPanel() {
    const stats = await getAdminDashboardStats();
    return <HrAdminAlerts stats={stats} />;
}

async function PendingItemsPanel() {
    const items = await getPendingApprovals();
    return <HrAdminPendingItems items={items} />;
}

function StatsRowSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-7 w-12" />
                        <Skeleton className="mt-1 h-3 w-20" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function CardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    );
}
