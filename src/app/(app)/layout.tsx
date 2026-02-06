import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { AppLayoutFallback } from './_components/app-layout-fallback';
import { AppLayoutShell } from './_components/app-layout-shell';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<AppLayoutFallback />}>
            <AppLayoutShell>{children}</AppLayoutShell>
        </Suspense>
    );
}
