/**
 * 📋 Premium Data Display Components
 * 
 * Lists, key-value pairs, and data presentation.
 * Server Component.
 * 
 * @module components/theme/elements/data-display
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Data List
// ============================================================================

export interface DataListItem {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
}

export interface DataListProps {
    items: DataListItem[];
    variant?: 'default' | 'striped' | 'bordered';
    className?: string;
}

export function DataList({ items, variant = 'default', className }: DataListProps) {
    return (
        <dl className={cn('space-y-0', className)} data-slot="data-list">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        'flex items-center justify-between py-3 px-4',
                        variant === 'striped' && index % 2 === 0 && 'bg-muted/50',
                        variant === 'bordered' && 'border-b border-border last:border-b-0',
                        variant === 'default' && 'border-b border-border/50 last:border-b-0',
                    )}
                >
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        {item.icon}
                        <span>{item.label}</span>
                    </dt>
                    <dd className="font-medium text-sm">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

// ============================================================================
// Key Value Grid
// ============================================================================

export interface KeyValueGridProps {
    items: DataListItem[];
    columns?: 1 | 2 | 3;
    className?: string;
}

export function KeyValueGrid({ items, columns = 2, className }: KeyValueGridProps) {
    const colsClass = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <div className={cn('grid gap-4', colsClass, className)} data-slot="kv-grid">
            {items.map((item, index) => (
                <div key={index} className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        {item.icon}
                        {item.label}
                    </p>
                    <p className="font-medium">{item.value}</p>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// Timeline
// ============================================================================

export interface TimelineItem {
    title: string;
    description?: string;
    timestamp?: string;
    icon?: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface TimelineProps {
    items: TimelineItem[];
    className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
    return (
        <div className={cn('relative pl-6', className)} data-slot="timeline">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-accent to-muted" />

            <div className="space-y-6">
                {items.map((item, index) => (
                    <div key={index} className="relative">
                        {/* Dot */}
                        <div
                            className={cn(
                                'absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-background',
                                item.variant === 'success' && 'bg-green-500',
                                item.variant === 'warning' && 'bg-yellow-500',
                                item.variant === 'error' && 'bg-destructive',
                                (!item.variant || item.variant === 'default') && 'bg-primary',
                            )}
                        />
                        <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-sm flex items-center gap-2">
                                    {item.icon}
                                    {item.title}
                                </p>
                                {item.timestamp && (
                                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                                )}
                            </div>
                            {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Empty State
// ============================================================================

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)} data-slot="empty-state">
            {icon && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="font-semibold text-lg">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
