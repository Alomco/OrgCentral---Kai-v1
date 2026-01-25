import type { ReactNode } from 'react';

export default function HrLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <a
                href="#hr-main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-(--z-overlay) rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
                Skip to content
            </a>
            <div className="relative isolate hr-page-shell">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-20 gradient-mesh opacity-60 dark:opacity-70 saturate-150 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 page-mesh"
                />
                <div id="hr-main-content" tabIndex={-1} className="relative mx-auto w-full max-w-6xl px-6 py-6">
                    {children}
                </div>
            </div>
        </>
    );
}
