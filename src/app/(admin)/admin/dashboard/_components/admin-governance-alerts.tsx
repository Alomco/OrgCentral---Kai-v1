import Link from 'next/link';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

import { ThemeCard, ThemeCardContent, ThemeCardDescription, ThemeCardHeader, ThemeCardTitle } from '@/components/theme/cards/theme-card';
import { ThemeBadge, ThemeButton } from '@/components/theme/primitives/interactive';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { GovernanceAlert } from '@/server/types/admin-dashboard';
import { getAdminDashboardGovernanceAlerts } from '@/server/use-cases/admin/dashboard/get-admin-dashboard-governance';

interface AdminGovernanceAlertsProps {
    authorization: RepositoryAuthorizationContext;
}

function resolveSeverityVariant(severity: GovernanceAlert['severity']): 'warning' | 'info' | 'destructive' {
    if (severity === 'high') {
        return 'destructive';
    }
    if (severity === 'medium') {
        return 'warning';
    }
    return 'info';
}

export async function AdminGovernanceAlerts({ authorization }: AdminGovernanceAlertsProps) {
    const alerts = await getAdminDashboardGovernanceAlerts(authorization);

    if (alerts.length === 0) {
        return (
            <ThemeCard variant="glass" padding="lg">
                <ThemeCardHeader>
                    <ThemeCardTitle size="md">Governance alerts</ThemeCardTitle>
                    <ThemeCardDescription>Compliance and risk notifications</ThemeCardDescription>
                </ThemeCardHeader>
                <ThemeCardContent>
                    <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-center">
                        <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm font-semibold text-foreground">All clear</p>
                        <p className="text-xs text-muted-foreground">
                            No governance alerts require attention right now.
                        </p>
                    </div>
                </ThemeCardContent>
            </ThemeCard>
        );
    }

    return (
        <ThemeCard variant="glass" padding="lg">
            <ThemeCardHeader>
                <ThemeCardTitle size="md">Governance alerts</ThemeCardTitle>
                <ThemeCardDescription>Compliance and risk notifications</ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-4 md:flex-row md:items-center md:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-lg bg-muted/50 p-2">
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <ThemeBadge variant={resolveSeverityVariant(alert.severity)} size="sm">
                                    {alert.severity.toUpperCase()}
                                </ThemeBadge>
                                {alert.actionHref ? (
                                    <Link href={alert.actionHref}>
                                        <ThemeButton variant="outline" size="sm">
                                            {alert.actionLabel ?? 'Review'}
                                        </ThemeButton>
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </ThemeCardContent>
        </ThemeCard>
    );
}

export function AdminGovernanceAlertsSkeleton() {
    return (
        <ThemeCard variant="glass" padding="lg">
            <ThemeCardHeader>
                <ThemeCardTitle size="md">Governance alerts</ThemeCardTitle>
                <ThemeCardDescription>Compliance and risk notifications</ThemeCardDescription>
            </ThemeCardHeader>
            <ThemeCardContent>
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={String(index)} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            </ThemeCardContent>
        </ThemeCard>
    );
}
