import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function ShowcaseCard({
    title,
    emoji,
    children,
    className,
}: {
    title: string;
    emoji: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn("p-6 rounded-2xl space-y-4", className)}
            data-ui-surface="item"
        >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="text-lg">{emoji}</span>
                <span className="uppercase tracking-wider">{title}</span>
            </div>
            {children}
        </div>
    );
}
