import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface HrGradientHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function HrGradientHeader({
    title,
    description,
    icon,
    actions,
    size = 'md',
}: HrGradientHeaderProps) {
    const sizeStyles = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
    } as const;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                {icon ? (
                    <div className={cn(
                        'flex items-center justify-center rounded-xl p-2.5',
                        'bg-linear-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]',
                        'text-white shadow-lg shadow-[hsl(var(--primary)/0.3)]',
                    )}>
                        {icon}
                    </div>
                ) : null}
                <div>
                    <h1 className={cn(
                        sizeStyles[size],
                        'font-bold tracking-tight',
                        'bg-linear-to-r from-[hsl(var(--foreground))] via-[hsl(var(--primary))] to-[hsl(var(--accent))]',
                        'bg-clip-text text-transparent',
                        'bg-size-[200%_auto] animate-[gradient-shift_3s_ease_infinite]',
                    )}>
                        {title}
                    </h1>
                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
            </div>
            {actions ? (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
            ) : null}
        </div>
    );
}
