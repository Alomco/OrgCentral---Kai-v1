import type { ReactNode } from 'react';
import { headers as nextHeaders } from 'next/headers';

import { HrNavigation } from './_components/hr-navigation';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';

export default async function HrLayout({ children }: { children: ReactNode }) {
    const headerStore = await nextHeaders();

    const { session, authorization } = await getSessionContextOrRedirect({}, {
        headers: headerStore,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'ui:hr:layout',
    });

    const userEmailValue = session.user.email;
    const userEmail = typeof userEmailValue === 'string' && userEmailValue.trim().length > 0
        ? userEmailValue
        : null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <HrNavigation
                organizationId={authorization.orgId}
                roleKey={authorization.roleKey}
                permissions={authorization.permissions}
                userEmail={userEmail}
            />
            <main className="mx-auto w-full max-w-6xl px-6 py-6">{children}</main>
        </div>
    );
}
