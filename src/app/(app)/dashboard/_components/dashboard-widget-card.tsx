import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type DashboardWidgetState = 'ready' | 'locked' | 'comingSoon' | 'error';

export interface DashboardWidgetCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    value?: string;
    href?: string;
    ctaLabel?: string;
    state?: DashboardWidgetState;
    statusLabel?: string;
    footerHint?: ReactNode;
}

export function DashboardWidgetCard(props: DashboardWidgetCardProps) {
    const state = props.state ?? 'ready';
    const Icon = props.icon;

    const navigation =
        state === 'ready' && props.href && props.ctaLabel
            ? { href: props.href, label: props.ctaLabel }
            : null;

    const statusBadge =
        state === 'locked'
            ? { label: props.statusLabel ?? 'Locked', variant: 'destructive' as const }
            : state === 'comingSoon'
                ? { label: props.statusLabel ?? 'Coming soon', variant: 'secondary' as const }
                : state === 'error'
                    ? { label: props.statusLabel ?? 'Error', variant: 'destructive' as const }
                    : null;

    return (
        <article className="glass-card-wrapper group h-full">
            <Card className="glass-card flex h-full flex-col rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 relative z-20 bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900/90 dark:via-blue-950/50 dark:to-purple-950/50 border-none overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6 relative z-10">
                    <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">{props.title}</CardTitle>
                        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{props.description}</CardDescription>
                    </div>
                    <div className="flex items-center justify-center rounded-lg p-2.5 bg-linear-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
                        <Icon className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 p-6 pt-0 relative z-10">
                    {state === 'error' ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                            <div className="text-base font-semibold text-slate-900 dark:text-white">{statusBadge?.label ?? 'Error'}</div>
                            {props.footerHint ? (
                                <div className="text-sm text-center text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {props.footerHint}
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {props.value ?? '0'}
                                </div>
                                {statusBadge ? (
                                    <Badge variant={statusBadge.variant} className="shrink-0 text-xs">
                                        {statusBadge.label}
                                    </Badge>
                                ) : null}
                            </div>
                            {props.footerHint ? (
                                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {props.footerHint}
                                </div>
                            ) : null}
                        </>
                    )}
                    <div className="mt-auto pt-4">
                        {navigation ? (
                            <Button asChild className="w-full" size="sm" variant="default">
                                <Link href={navigation.href}>{navigation.label}</Link>
                            </Button>
                        ) : props.href && props.ctaLabel ? (
                            <Button className="w-full" size="sm" variant="secondary" disabled>
                                {props.ctaLabel}
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </article>
    );
}
