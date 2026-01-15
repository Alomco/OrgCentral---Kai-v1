import { KeyRound, ShieldCheck, UserPlus, Users } from 'lucide-react';

import { ThemeGrid } from '@/components/theme/layout/primitives';
import { ThemeCard } from '@/components/theme/cards/theme-card';
import { GradientAccent } from '@/components/theme/primitives/surfaces';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getAdminDashboardKpis } from '@/server/use-cases/admin/dashboard/get-admin-dashboard-kpis';

interface AdminKpiGridProps {
    authorization: RepositoryAuthorizationContext;
}

export async function AdminKpiGrid({ authorization }: AdminKpiGridProps) {
    const kpis = await getAdminDashboardKpis(authorization);

    const complianceLabel = kpis.complianceScore !== null ? `${String(kpis.complianceScore)}%` : 'No data';

    return (
        <ThemeGrid cols={4} gap="lg">
            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Active members</p>
                        <p className="text-3xl font-semibold text-foreground">{kpis.activeMembers}</p>
                    </div>
                    <GradientAccent variant="primary" rounded="lg" className="p-3">
                        <Users className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>

            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending invites</p>
                        <p className="text-3xl font-semibold text-foreground">{kpis.pendingInvites}</p>
                    </div>
                    <GradientAccent variant="sunset" rounded="lg" className="p-3">
                        <UserPlus className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>

            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total roles</p>
                        <p className="text-3xl font-semibold text-foreground">{kpis.totalRoles}</p>
                    </div>
                    <GradientAccent variant="accent" rounded="lg" className="p-3">
                        <KeyRound className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>

            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Compliance score</p>
                        <p className="text-3xl font-semibold text-foreground">{complianceLabel}</p>
                    </div>
                    <GradientAccent variant="vibrant" rounded="lg" className="p-3">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>
        </ThemeGrid>
    );
}

export function AdminKpiGridSkeleton() {
    return (
        <ThemeGrid cols={4} gap="lg">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={String(index)} className="h-28 rounded-2xl bg-muted/20 animate-pulse" />
            ))}
        </ThemeGrid>
    );
}
