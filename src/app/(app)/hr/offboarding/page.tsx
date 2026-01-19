import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

import { HrPageHeader } from '../_components/hr-page-header';
import { OffboardingQueuePanel } from './_components/offboarding-queue-panel';

export const metadata: Metadata = {
    title: 'Offboarding Queue',
    description: 'Track in-progress offboarding workflows and completion status.',
};

interface OffboardingPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OffboardingPage({ searchParams }: OffboardingPageProps) {
    const headerStore = await nextHeaders();
    const session = await getSessionContextOrRedirect({}, {
        headers: headerStore,
        requiredPermissions: { [HR_RESOURCE.HR_OFFBOARDING]: ['list'] },
        auditSource: 'ui:hr:offboarding:queue',
        action: HR_ACTION.LIST,
        resourceType: HR_RESOURCE.HR_OFFBOARDING,
    });

    const resolvedSearchParams = (await searchParams) ?? {};

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
                        <BreadcrumbPage>Offboarding</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Offboarding queue"
                description="Monitor and complete employee offboarding workflows"
                icon={<ClipboardList className="h-5 w-5" />}
            />

            <Suspense fallback={<QueueSkeleton />}>
                <OffboardingQueuePanel
                    authorization={session.authorization}
                    searchParams={resolvedSearchParams}
                />
            </Suspense>
        </div>
    );
}

function QueueSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-72 w-full" />
        </div>
    );
}
