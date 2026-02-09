import type { ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';

import { SkipLink } from '@/components/ui/skip-link';
import { TenantThemeRegistry } from '@/components/theme/tenant-theme-registry';
import { AppLayoutClientShell } from '@/app/(app)/_components/app-layout-client-shell';
import { getOrgBranding } from '@/server/branding/get-org-branding';
import { listHrNotifications } from '@/app/(app)/hr/notifications/actions';
import { buildAppSessionSnapshot, buildOrgBrandingSnapshot } from '@/server/ui/app-context-snapshots';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { FloatingParticles } from '@/components/theme/decorative/particles';
import { GradientOrb } from '@/components/theme/decorative/effects';

export async function AppLayoutShell({ children }: { children: ReactNode }) {
    noStore();

    const headerStore = await headers();
    const nonce = headerStore.get('x-nonce') ?? undefined;

    const { session, authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:app-layout',
        },
    );

    const [brandingResult, notificationsResult] = await Promise.allSettled([
        getOrgBranding({
            orgId: authorization.orgId,
            classification: authorization.dataClassification,
            residency: authorization.dataResidency,
        }),
        listHrNotifications({ limit: 5 }),
    ]);

    const branding = brandingResult.status === 'fulfilled' ? brandingResult.value : null;
    const { notifications = [], unreadCount = 0 } =
        notificationsResult.status === 'fulfilled' ? notificationsResult.value : {};

    const sessionSnapshot = buildAppSessionSnapshot(session, authorization);
    const brandingSnapshot = buildOrgBrandingSnapshot(branding);
    const showDevelopmentThemeWidget = process.env.NODE_ENV === 'development';

    const background = (
        <>
            <FloatingParticles count={6} />
            <GradientOrb position="top-right" color="multi" className="opacity-24" />
            <GradientOrb position="bottom-left" color="multi" className="opacity-10" />
        </>
    );

    return (
        <TenantThemeRegistry
            orgId={authorization.orgId}
            cacheContext={{
                classification: authorization.dataClassification,
                residency: authorization.dataResidency,
            }}
            nonce={nonce}
        >
            <SkipLink targetId="app-main-content" />
            <AppLayoutClientShell
                session={session}
                authorization={authorization}
                organizationLabel={branding?.companyName ?? null}
                branding={branding}
                notifications={notifications}
                unreadCount={unreadCount}
                sessionSnapshot={sessionSnapshot}
                brandingSnapshot={brandingSnapshot}
                showDevelopmentThemeWidget={showDevelopmentThemeWidget}
                background={background}
            >
                {children}
            </AppLayoutClientShell>
        </TenantThemeRegistry>
    );
}
