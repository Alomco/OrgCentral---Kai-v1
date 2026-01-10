import type { ReactNode } from 'react';

export default function HrLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <a
                href="#hr-main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:[z-index:var(--z-overlay)] rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
                Skip to content
            </a>
            <div id="hr-main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-6 py-6">
                {children}
            </div>
        </>
    );
}
