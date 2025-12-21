'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { AppSessionContextValue, AppSessionDerived, AppSessionSnapshot } from '@/types/app-context';

const AppSessionContext = createContext<AppSessionContextValue | undefined>(undefined);

const anonymousDerived: AppSessionDerived = {
    isAuthenticated: false,
    hasOrgContext: false,
    roleKeyNormalized: 'anonymous',
    isSuperAdmin: false,
    isAdminLike: false,
};

export function AppSessionProvider({
    children,
    session,
}: {
    children: ReactNode;
    session: AppSessionSnapshot | null;
}) {
    return <AppSessionContext.Provider value={{ session, derived: deriveSession(session) }}>{children}</AppSessionContext.Provider>;
}

export function useOptionalAppSession(): AppSessionSnapshot | null {
    const context = useContext(AppSessionContext);
    if (!context) {
        throw new Error('useOptionalAppSession must be used within AppSessionProvider');
    }
    return context.session;
}

export function useAppSession(): AppSessionSnapshot {
    const session = useOptionalAppSession();
    if (!session) {
        throw new Error('useAppSession expected an authenticated session');
    }
    return session;
}

export function useSessionMeta(): AppSessionDerived {
    const context = useContext(AppSessionContext);
    if (!context) {
        throw new Error('useSessionMeta must be used within AppSessionProvider');
    }
    return context.derived;
}

function deriveSession(session: AppSessionSnapshot | null): AppSessionDerived {
    if (!session) {
        return anonymousDerived;
    }

    const roleKeyNormalized = session.roleKey.toLowerCase();
    const isSuperAdmin = ['super_admin', 'super-admin', 'dev-super-admin', 'superadmin', 'root'].includes(roleKeyNormalized);
    const isAdminLike = isSuperAdmin || roleKeyNormalized.includes('admin');

    return {
        isAuthenticated: true,
        hasOrgContext: Boolean(session.orgId),
        roleKeyNormalized: roleKeyNormalized || 'unknown',
        isSuperAdmin,
        isAdminLike,
    };
}
