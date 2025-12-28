import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { TenantThemeRegistry } from '@/components/theme/tenant-theme-registry';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getOrgBranding } from '@/server/branding/get-org-branding';
import {
    getMembershipRoleSnapshot,
    resolveRoleDashboard,
    ROLE_DASHBOARD_PATHS,
} from '@/server/ui/auth/role-redirect';

import { AdminNavigation } from './_components/admin-navigation';
import { AdminShell } from '../_components/admin-shell';

async function AdminLayoutContent({ children }: { children: ReactNode }) {
    const headerStore = await headers();
    const { session, authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:admin-layout',
        },
    );

    const membershipSnapshot = await getMembershipRoleSnapshot(
        authorization.orgId,
        authorization.userId,
    );
    const dashboardRole = membershipSnapshot ? resolveRoleDashboard(membershipSnapshot) : 'employee';

    if (dashboardRole !== 'globalAdmin') {
        redirect(ROLE_DASHBOARD_PATHS[dashboardRole]);
    }

    const branding = await getOrgBranding({
        orgId: authorization.orgId,
        classification: authorization.dataClassification,
        residency: authorization.dataResidency,
    }).catch(() => null);

    const userEmail = typeof session.user.email === 'string' && session.user.email.trim().length > 0
        ? session.user.email
        : null;

    return (
        <TenantThemeRegistry
            orgId={authorization.orgId}
            cacheContext={{
                classification: authorization.dataClassification,
                residency: authorization.dataResidency,
            }}
        >
            <AdminShell
                navigation={
                    <AdminNavigation
                        organizationId={authorization.orgId}
                        organizationLabel={branding?.companyName ?? null}
                        roleKey={authorization.roleKey}
                        permissions={authorization.permissions}
                        userEmail={userEmail}
                    />
                }
                orbColor="primary"
                particleCount={6}
            >
                {/* 
                  We use a plain div here because Admin pages likely have their own specialized containers.
                  Using PageContainer here might double-pad. 
                  Future refactors can move individual pages to use local PageContainers.
                */}
                <div className="w-full h-full">
                    {children}
                </div>
            </AdminShell>
        </TenantThemeRegistry>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense
            fallback={(
                <div className="min-h-screen bg-background text-foreground">
                    <main className="mx-auto w-full max-w-6xl px-6 py-6">
                        <div className="text-sm text-muted-foreground">Loading admin…</div>
                    </main>
                </div>
            )}
        >
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}
