import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react';
import { RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SeederCardProps {
    icon: LucideIcon;
    title: string;
    count: number;
    onSeed: () => void;
    isPending: boolean;
    label?: string;
}

export function SeederCard({ icon: Icon, title, count, onSeed, isPending, label }: SeederCardProps): JSX.Element {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">{title}</h4>
                        <p className="text-2xl font-bold tracking-tight">{count}</p>
                        {label ? <p className="text-xs text-muted-foreground">{label}</p> : null}
                    </div>
                </div>
                <button
                    onClick={onSeed}
                    disabled={isPending}
                    className="rounded-full p-2 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                    title={`Seed ${title}`}
                >
                    <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
                </button>
            </div>
        </div>
    );
}

export function RocketIcon(props: JSX.IntrinsicElements['svg']): JSX.Element {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    );
}
