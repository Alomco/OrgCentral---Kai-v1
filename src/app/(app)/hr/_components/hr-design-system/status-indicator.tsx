import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral';

const statusColors: Record<StatusVariant, { bg: string; text: string; glow: string }> = {
    success: {
        bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        glow: 'shadow-emerald-500/30',
    },
    warning: {
        bg: 'bg-amber-500/15 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-400',
        glow: 'shadow-amber-500/30',
    },
    error: {
        bg: 'bg-rose-500/15 dark:bg-rose-500/20',
        text: 'text-rose-700 dark:text-rose-400',
        glow: 'shadow-rose-500/30',
    },
    info: {
        bg: 'bg-[hsl(var(--primary)/0.15)]',
        text: 'text-[hsl(var(--primary))]',
        glow: 'shadow-[hsl(var(--primary)/0.3)]',
    },
    pending: {
        bg: 'bg-violet-500/15 dark:bg-violet-500/20',
        text: 'text-violet-700 dark:text-violet-400',
        glow: 'shadow-violet-500/30',
    },
    neutral: {
        bg: 'bg-slate-500/15 dark:bg-slate-500/20',
        text: 'text-slate-700 dark:text-slate-400',
        glow: 'shadow-slate-500/30',
    },
};

export interface HrStatusIndicatorProps {
    status: StatusVariant;
    label: string;
    icon?: ReactNode;
    glow?: boolean;
}

export function HrStatusIndicator({ status, label, icon, glow = false }: HrStatusIndicatorProps) {
    const colors = statusColors[status];

    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            colors.bg,
            colors.text,
            glow && `shadow-lg ${colors.glow}`,
            'transition-all duration-200',
        )}>
            {icon}
            {label}
        </span>
    );
}
