'use client';

import { Check, Circle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ChecklistItemProgress } from '@/server/types/onboarding-types';
import { formatChecklistDate } from './checklist-utils';

export interface ChecklistItemProps {
    item: ChecklistItemProgress;
    onToggle?: () => void;
    isPending?: boolean;
    disabled?: boolean;
}

export function ChecklistItem({ item, onToggle, isPending, disabled }: ChecklistItemProps) {
    const isInteractive = Boolean(onToggle);

    const className = cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
        item.completed && 'bg-muted/50',
        isInteractive && !disabled && 'cursor-pointer hover:bg-muted/30',
        disabled && 'cursor-not-allowed opacity-70',
    );

    if (isInteractive) {
        return (
            <button
                type="button"
                className={className}
                onClick={onToggle}
                disabled={Boolean(disabled)}
            >
                <div className="mt-0.5 shrink-0">
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : item.completed ? (
                        <Check className="h-4 w-4 text-success" />
                    ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 space-y-0.5">
                    <p
                        className={cn(
                            'text-sm font-medium',
                            item.completed && 'text-muted-foreground line-through',
                        )}
                    >
                        {item.task}
                    </p>
                    {item.notes && (
                        <p className="text-xs text-muted-foreground">{item.notes}</p>
                    )}
                    {item.completed && item.completedAt && (
                        <p className="text-xs text-success">
                            Completed {formatChecklistDate(item.completedAt)}
                        </p>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className={className}>
            <div className="mt-0.5 shrink-0">
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : item.completed ? (
                    <Check className="h-4 w-4 text-success" />
                ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                )}
            </div>
            <div className="flex-1 space-y-0.5">
                <p
                    className={cn(
                        'text-sm font-medium',
                        item.completed && 'text-muted-foreground line-through',
                    )}
                >
                    {item.task}
                </p>
                {item.notes && (
                    <p className="text-xs text-muted-foreground">{item.notes}</p>
                )}
                {item.completed && item.completedAt && (
                    <p className="text-xs text-success">
                        Completed {formatChecklistDate(item.completedAt)}
                    </p>
                )}
            </div>
        </div>
    );
}
