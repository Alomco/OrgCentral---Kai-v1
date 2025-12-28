/**
 * 📊 Premium Stats & Metrics Components
 * 
 * Stats cards, counters, and metric displays.
 * Server Component with CVA.
 * 
 * @module components/theme/elements/stats
 */

import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MUTED_TEXT_CLASS = 'text-muted-foreground';

// ============================================================================
// Stat Card
// ============================================================================

const statCardVariants = cva(
    'rounded-lg border p-4 transition-all',
    {
        variants: {
            variant: {
                default: 'bg-card',
                glass: 'bg-card/50 backdrop-blur-md border-border/30',
                gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20',
                solid: 'bg-primary text-primary-foreground border-primary',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface StatCardProps extends VariantProps<typeof statCardVariants> {
    /** Label/title */
    label: string;
    /** Main value */
    value: string | number;
    /** Trend indicator */
    trend?: 'up' | 'down' | 'neutral';
    /** Trend percentage */
    trendValue?: string;
    /** Icon */
    icon?: ReactNode;
    /** Additional class */
    className?: string;
}

export function StatCard({
    label,
    value,
    trend,
    trendValue,
    icon,
    variant,
    className,
}: StatCardProps) {
    return (
        <div className={cn(statCardVariants({ variant }), className)} data-slot="stat-card">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className={cn(
                        'text-sm font-medium',
                        variant === 'solid' ? 'text-primary-foreground/80' : MUTED_TEXT_CLASS
                    )}>
                        {label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                </div>
                {icon && (
                    <div className={cn(
                        'rounded-lg p-2',
                        variant === 'solid'
                            ? 'bg-primary-foreground/20'
                            : 'bg-primary/10 text-primary'
                    )}>
                        {icon}
                    </div>
                )}
            </div>
            {trend && trendValue && (
                <div className="mt-3 flex items-center gap-1 text-sm">
                    {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
                    {trend === 'neutral' && <Minus className={`h-4 w-4 ${MUTED_TEXT_CLASS}`} />}
                    <span className={cn(
                        trend === 'up' && 'text-green-500',
                        trend === 'down' && 'text-destructive',
                        trend === 'neutral' && MUTED_TEXT_CLASS,
                    )}>
                        {trendValue}
                    </span>
                    <span className={variant === 'solid' ? 'text-primary-foreground/60' : MUTED_TEXT_CLASS}>
                        vs last period
                    </span>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Inline Stat
// ============================================================================

export interface InlineStatProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    className?: string;
}

export function InlineStat({ label, value, icon, className }: InlineStatProps) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            {icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
            )}
            <div>
                <p className="text-lg font-semibold">{value}</p>
                <p className={`text-xs ${MUTED_TEXT_CLASS}`}>{label}</p>
            </div>
        </div>
    );
}

// ============================================================================
// Progress Stat
// ============================================================================

export interface ProgressStatProps {
    label: string;
    current: number;
    max: number;
    unit?: string;
    className?: string;
}

export function ProgressStat({ label, current, max, unit = '', className }: ProgressStatProps) {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={MUTED_TEXT_CLASS}>
                    {current}{unit} / {max}{unit}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${percentage.toFixed(2)}%` }}
                />
            </div>
        </div>
    );
}
