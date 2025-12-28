import type { ReactNode } from 'react';
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

import { AdminNavigation } from '@/app/(admin)/admin/_components/admin-navigation';
import { AdminShell } from '@/app/(admin)/_components/admin-shell';
import { DevelopmentViewSwitcher } from './_components/development-view-switcher';

export default async function DevelopmentLayout({ children }: { children: ReactNode }) {
    const headerStore = await headers();
    const { session, authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:dev-layout',
        },
    );

    const membershipSnapshot = await getMembershipRoleSnapshot(
        authorization.orgId,
        authorization.userId,
    );
    const dashboardRole = membershipSnapshot ? resolveRoleDashboard(membershipSnapshot) : 'employee';

    // Dev section requires globalAdmin (GLOBAL scope role)
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
                orbColor="multi"
                particleCount={8}
            >
                <DevelopmentViewSwitcher>
                    {children}
                </DevelopmentViewSwitcher>
            </AdminShell>
        </TenantThemeRegistry>
    );
}
