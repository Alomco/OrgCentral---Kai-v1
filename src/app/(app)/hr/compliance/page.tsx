import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { headers as nextHeaders } from 'next/headers';
import { ShieldCheck } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';

import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getComplianceStatusService } from '@/server/services/hr/compliance/compliance-status.service.provider';
import { PrismaComplianceTemplateRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-template-repository';
import { listComplianceTemplates } from '@/server/use-cases/hr/compliance/list-compliance-templates';
import { listEmployeeProfilesForUi } from '@/server/use-cases/hr/people/list-employee-profiles.cached';

import { HrPageHeader } from '../_components/hr-page-header';
import { ComplianceItemsPanel } from './_components/compliance-items-panel';
import { ComplianceReviewQueuePanel } from './_components/compliance-review-queue-panel';
import { ComplianceTemplatesPanel } from './_components/compliance-templates-panel';
import { BulkAssignDialog } from './_components/bulk-assign-dialog';
import { ComplianceExpiryPanelLoader } from './_components/compliance-expiry-panel-loader';
import { ComplianceCategoryManager } from './_components/compliance-category-manager';

export const metadata: Metadata = {
    title: 'Compliance',
    description: 'Track assigned compliance items, expirations, and reminders.',
};

export default async function HrCompliancePage() {
    const headerStore = await nextHeaders();

    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { employeeProfile: ['read'] },
            auditSource: 'ui:hr:compliance',
            action: 'read',
            resourceType: 'hr.compliance',
            resourceAttributes: { view: 'page' },
        },
    );

    const complianceService = getComplianceStatusService();
    const status = await complianceService
        .getStatusForUser(authorization, authorization.userId)
        .then((snapshot) => snapshot)
        .catch(() => null);

    const adminAuthorization = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:hr:compliance:review-queue',
            action: 'list',
            resourceType: 'hr.compliance',
            resourceAttributes: { view: 'review-queue' },
        },
    )
        .then((result) => result.authorization)
        .catch(() => null);

    const adminData = adminAuthorization
        ? await Promise.all([
            listComplianceTemplates(
                { complianceTemplateRepository: new PrismaComplianceTemplateRepository() },
                { authorization: adminAuthorization },
            ),
            listEmployeeProfilesForUi({ authorization: adminAuthorization }),
        ])
        : null;

    const templates = adminData?.[0] ?? [];
    const employees = adminData?.[1]?.profiles ?? [];

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/hr">HR</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Compliance</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Compliance"
                description={
                    status
                        ? `Status: ${status.status} • ${String(status.itemCount)} item(s)`
                        : 'Track assigned compliance items, expirations, and reminders.'
                }
                icon={<ShieldCheck className="h-5 w-5" />}
            />

            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading compliance items…</div>}>
                <ComplianceItemsPanel authorization={authorization} userId={authorization.userId} />
            </Suspense>

            {adminAuthorization ? (
                <div className="space-y-6">
                    {/* Bulk Assign Action */}
                    <div className="flex justify-end">
                        <BulkAssignDialog
                            templates={templates.map((template) => {
                                const categoryKey = template.categoryKey?.trim();
                                return {
                                    id: template.id,
                                    name: template.name,
                                    category: (categoryKey && categoryKey.length > 0 ? categoryKey : undefined) ?? 'General',
                                    items: template.items.map((item) => ({ id: item.id, name: item.name })),
                                };
                            })}
                            employees={employees.map((profile) => {
                                const displayName = profile.displayName?.trim();
                                const fallbackName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
                                const safeFallbackName = fallbackName.length > 0 ? fallbackName : undefined;
                                return {
                                    id: profile.userId,
                                    name: displayName ?? safeFallbackName ?? profile.email ?? profile.userId,
                                    department: profile.jobTitle ?? profile.departmentId ?? 'General',
                                };
                            })}
                        />
                    </div>
                    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading expiry data…</div>}>
                        <ComplianceExpiryPanelLoader authorization={adminAuthorization} />
                    </Suspense>
                    <ComplianceCategoryManager initialCategories={[]} />
                    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading templates…</div>}>
                        <ComplianceTemplatesPanel authorization={adminAuthorization} />
                    </Suspense>
                    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading review queue…</div>}>
                        <ComplianceReviewQueuePanel authorization={adminAuthorization} />
                    </Suspense>
                </div>
            ) : null}
        </div>
    );
}

