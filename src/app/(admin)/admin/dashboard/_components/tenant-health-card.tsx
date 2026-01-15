import { Activity } from 'lucide-react';

import { ThemeBadge } from '@/components/theme/primitives/interactive';
import {
    ThemeCard,
    ThemeCardContent,
    ThemeCardDescription,
    ThemeCardHeader,
    ThemeCardTitle,
} from '@/components/theme/cards/theme-card';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { TenantHealthStatus } from '@/server/types/admin-dashboard';
import { getAdminDashboardTenantHealth } from '@/server/use-cases/admin/dashboard/get-admin-dashboard-tenant-health';

interface TenantHealthCardProps {
    authorization: RepositoryAuthorizationContext;
}

function resolveStatusVariant(status: TenantHealthStatus) {
    if (status === 'critical') {
        return 'destructive';
    }
    if (status === 'attention') {
        return 'warning';
    }
    return 'success';
}

export async function TenantHealthCard({ authorization }: TenantHealthCardProps) {
    const health = await getAdminDashboardTenantHealth(authorization);

    return (
        <ThemeCard variant="glass" hover="lift" padding="lg" className="h-full">
            <ThemeCardHeader accent>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <ThemeCardTitle size="md">Tenant health overview</ThemeCardTitle>
                        <ThemeCardDescription>
                            Residency, classification, and operational posture for this tenant.
                        </ThemeCardDescription>
                    </div>
                    <ThemeBadge variant={resolveStatusVariant(health.status)} size="sm">
                        {health.status}
                    </ThemeBadge>
                </div>
            </ThemeCardHeader>
            <ThemeCardContent>
                <div className="space-y-3">
                    {health.indicators.map((indicator) => (
                        <div
                            key={indicator.label}
                            className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-card/40 p-4"
                        >
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">{indicator.label}</p>
                                <p className="text-sm font-semibold text-foreground mt-1">{indicator.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{indicator.description}</p>
                            </div>
                            <ThemeBadge variant={resolveStatusVariant(indicator.status)} size="sm">
                                {indicator.status}
                            </ThemeBadge>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Live health signals update every few minutes.
                </div>
            </ThemeCardContent>
        </ThemeCard>
    );
}

export function TenantHealthSkeleton() {
    return (
        <ThemeCard variant="glass" padding="lg" className="h-full">
            <div className="h-5 w-40 rounded bg-muted/40 animate-pulse" />
            <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={String(index)} className="h-14 rounded-lg bg-muted/20 animate-pulse" />
                ))}
            </div>
        </ThemeCard>
    );
}
