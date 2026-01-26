import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'HR Administration',
    description: 'Manage employees, compliance, and HR operations.',
};

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
import { HrAdminAlerts } from './_components/hr-admin-alerts';
import { HrAdminPendingItems } from './_components/hr-admin-pending-items';
import { HrAdminQuickActions } from './_components/hr-admin-quick-actions';
import { HrAdminStatsRow } from './_components/hr-admin-stats-row';
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

    const statsPromise = getAdminDashboardStats();

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

            <Suspense fallback={<StatsRowSkeleton />}>
                <StatsRow statsPromise={statsPromise} />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
                <HrAdminQuickActions />

                <Suspense fallback={<CardSkeleton />}>
                    <AlertsPanel statsPromise={statsPromise} />
                </Suspense>
            </div>

            <Suspense fallback={<CardSkeleton />}>
                <PendingItemsPanel />
            </Suspense>
        </div>
    );
}

async function StatsRow({ statsPromise }: { statsPromise: ReturnType<typeof getAdminDashboardStats> }) {
    const stats = await statsPromise;
    return <HrAdminStatsRow stats={stats} />;
}

async function AlertsPanel({ statsPromise }: { statsPromise: ReturnType<typeof getAdminDashboardStats> }) {
    const stats = await statsPromise;
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
