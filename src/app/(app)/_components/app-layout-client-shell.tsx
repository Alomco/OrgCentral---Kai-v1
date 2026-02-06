'use client';

import type { ReactNode } from 'react';

import type { AuthSession } from '@/server/lib/auth';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgBranding } from '@/server/types/branding-types';
import type { NotificationSummary } from '@/components/notifications/notification-item';
import type { AppSessionSnapshot, OrgBrandingSnapshot } from '@/types/app-context';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { DevelopmentThemeWidget } from '@/components/dev/DevelopmentThemeWidget';

import { AppClientProviders } from './app-client-providers';

interface AppLayoutClientShellProps {
    children: ReactNode;
    session: NonNullable<AuthSession>;
    authorization: RepositoryAuthorizationContext;
    organizationLabel: string | null;
    branding: OrgBranding | null;
    notifications: NotificationSummary[];
    unreadCount: number;
    sessionSnapshot: AppSessionSnapshot | null;
    brandingSnapshot: OrgBrandingSnapshot | null;
    showDevelopmentThemeWidget: boolean;
    background?: ReactNode;
}

export function AppLayoutClientShell({
    children,
    session,
    authorization,
    organizationLabel,
    branding,
    notifications,
    unreadCount,
    sessionSnapshot,
    brandingSnapshot,
    showDevelopmentThemeWidget,
    background,
}: AppLayoutClientShellProps) {
    return (
        <SidebarProvider>
            <AppSidebar
                session={session}
                authorization={authorization}
                organizationLabel={organizationLabel}
            />
            <SidebarInset className="flex h-svh flex-col relative min-h-0 transition-colors duration-300">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {background}
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                    <AppHeader
                        session={session}
                        authorization={authorization}
                        branding={branding}
                        notifications={notifications}
                        unreadCount={unreadCount}
                    />
                    <main id="app-main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto">
                        <AppClientProviders session={sessionSnapshot} branding={brandingSnapshot}>
                            {children}
                        </AppClientProviders>
                        <DevelopmentThemeWidget
                            enabled={showDevelopmentThemeWidget}
                            orgId={authorization.orgId}
                        />
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
