import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface HrGlassCardProps {
    children: ReactNode;
    className?: string;
    glow?: boolean;
    interactive?: boolean;
    animated?: boolean;
}

export function HrGlassCard({
    children,
    className,
    glow = false,
    interactive = true,
    animated = false,
}: HrGlassCardProps) {
    const baseStyles = cn(
        'relative rounded-xl overflow-hidden',
        'transition-all duration-300 ease-out',
    );

    const glowStyles = glow
        ? cn(
            'after:absolute after:inset-2 after:-z-10',
            'after:bg-gradient-to-r after:from-[hsl(var(--primary)/0.18)] after:to-[hsl(var(--accent)/0.18)]',
            'after:blur-lg after:opacity-0 hover:after:opacity-100',
            'after:transition-opacity after:duration-500',
        )
        : '';

    return (
        <div className={cn(animated && 'glass-card-wrapper')}>
            <div
                className={cn(baseStyles, glowStyles, className)}
                data-ui-surface="container"
                data-ui-interactive={interactive ? 'true' : undefined}
            >
                {children}
            </div>
        </div>
    );
}
