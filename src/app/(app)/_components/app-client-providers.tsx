'use client';

import type { ReactNode } from 'react';

import { BrandingProvider } from '@/context/branding-context';
import { AppSessionProvider } from '@/context/app-session-context';
import type { AppSessionSnapshot, OrgBrandingSnapshot } from '@/types/app-context';

export function AppClientProviders({
    children,
    session,
    branding,
}: {
    children: ReactNode;
    session: AppSessionSnapshot | null;
    branding: OrgBrandingSnapshot | null;
}) {
    return (
        <AppSessionProvider session={session}>
            <BrandingProvider branding={branding}>{children}</BrandingProvider>
        </AppSessionProvider>
    );
}
