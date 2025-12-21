'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { OrgBrandingSnapshot } from '@/types/app-context';

interface BrandingContextValue {
    branding: OrgBrandingSnapshot | null;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export function BrandingProvider({
    children,
    branding,
}: {
    children: ReactNode;
    branding: OrgBrandingSnapshot | null;
}) {
    return <BrandingContext.Provider value={{ branding }}>{children}</BrandingContext.Provider>;
}

export function useOptionalBranding(): OrgBrandingSnapshot | null {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useOptionalBranding must be used within BrandingProvider');
    }
    return context.branding;
}

export function useBranding(): OrgBrandingSnapshot {
    const branding = useOptionalBranding();
    if (!branding) {
        throw new Error('useBranding expected branding to be loaded');
    }
    return branding;
}
