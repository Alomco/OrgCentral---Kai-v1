import Link from 'next/link';
import { Shield, ShieldCheck } from 'lucide-react';

import { ThemeCard, ThemeCardContent, ThemeCardDescription, ThemeCardHeader, ThemeCardTitle } from '@/components/theme/cards/theme-card';
import { ThemeBadge } from '@/components/theme/primitives/interactive';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SecurityEventSummary } from '@/server/types/admin-dashboard';
import { getAdminDashboardSecurityEvents } from '@/server/use-cases/admin/dashboard/get-admin-dashboard-security-events';

interface AdminSecurityEventsProps {
    authorization: RepositoryAuthorizationContext;
}

function resolveSeverityVariant(
    severity: SecurityEventSummary['severity'],
): 'info' | 'warning' | 'destructive' {
    if (severity === 'high' || severity === 'critical') {
        return 'destructive';
    }
    if (severity === 'medium') {
        return 'warning';
    }
    return 'info';
}

function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) {
        return `${String(seconds)}s ago`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${String(minutes)}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${String(hours)}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${String(days)}d ago`;
}

export async function AdminSecurityEvents({ authorization }: AdminSecurityEventsProps) {
    const events = await getAdminDashboardSecurityEvents(authorization);

    if (events.length === 0) {
        return (
            <ThemeCard variant="glass" padding="lg">
                <ThemeCardHeader>
                    <ThemeCardTitle size="md">Recent security events</ThemeCardTitle>
                    <ThemeCardDescription>Last 7 days of security activity</ThemeCardDescription>
                </ThemeCardHeader>
                <ThemeCardContent>
                    <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center">
                        <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm font-semibold text-foreground">No incidents reported</p>
                        <p className="text-xs text-muted-foreground">
                            Security telemetry is stable with no notable events.
                        </p>
                    </div>
                </ThemeCardContent>
            </ThemeCard>
        );
    }

    return (
        <ThemeCard variant="glass" padding="lg">
            <ThemeCardHeader>
                <ThemeCardTitle size="md">Recent security events</ThemeCardTitle>
                <ThemeCardDescription>Last 7 days of security activity</ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-muted/50 p-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{event.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <ThemeBadge variant={resolveSeverityVariant(event.severity)} size="sm">
                                    {event.severity.toUpperCase()}
                                </ThemeBadge>
                                <span className="text-[11px] text-muted-foreground">
                                    {formatRelativeTime(event.occurredAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Link href="/dev/dashboard" className="text-xs font-semibold text-primary hover:text-primary/80">
                        View full security feed
                    </Link>
                </div>
            </ThemeCardContent>
        </ThemeCard>
    );
}

export function AdminSecurityEventsSkeleton() {
    return (
        <ThemeCard variant="glass" padding="lg">
            <ThemeCardHeader>
                <ThemeCardTitle size="md">Recent security events</ThemeCardTitle>
                <ThemeCardDescription>Last 7 days of security activity</ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={String(index)} className="h-14 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            </ThemeCardContent>
        </ThemeCard>
    );
}
