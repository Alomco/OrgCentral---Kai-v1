import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { HrGlassCard } from './glass-card';

export interface HrStatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: { value: number; label: string };
    accentColor?: 'primary' | 'accent' | 'success' | 'warning';
}

const accentStyles = {
    primary: {
        icon: 'from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]',
        bar: 'bg-linear-to-b from-[hsl(var(--primary))] to-[hsl(var(--accent)/0.6)] shadow-[0_0_12px_hsl(var(--primary)/0.35)]',
    },
    accent: {
        icon: 'from-[hsl(var(--accent))] to-[hsl(var(--accent)/0.7)]',
        bar: 'bg-linear-to-b from-[hsl(var(--accent))] to-[hsl(var(--primary)/0.6)] shadow-[0_0_12px_hsl(var(--accent)/0.35)]',
    },
    success: {
        icon: 'from-emerald-500 to-emerald-400',
        bar: 'bg-linear-to-b from-emerald-500 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    },
    warning: {
        icon: 'from-amber-500 to-amber-400',
        bar: 'bg-linear-to-b from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    },
} as const;

export function HrStatCard({
    label,
    value,
    icon,
    trend,
    accentColor = 'primary',
}: HrStatCardProps) {
    const accent = accentStyles[accentColor];

    return (
        <HrGlassCard className={cn('relative p-5 pl-8')}>
            <span
                aria-hidden="true"
                className={cn('absolute inset-y-4 left-3 w-1 rounded-full', accent.bar)}
            />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
                    {trend ? (
                        <p className={cn(
                            'mt-1 text-xs font-medium',
                            trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600',
                        )}>
                            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
                        </p>
                    ) : null}
                </div>
                {icon ? (
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-lg p-2',
                            'bg-linear-to-br text-white',
                            accent.icon,
                        )}
                    >
                        {icon}
                    </div>
                ) : null}
            </div>
        </HrGlassCard>
    );
}
