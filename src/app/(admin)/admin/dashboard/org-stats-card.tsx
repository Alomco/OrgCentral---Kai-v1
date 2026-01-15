import { headers } from 'next/headers';
import { KeyRound, UserPlus, Users } from 'lucide-react';

import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getUserService } from '@/server/services/org/users/user-service.provider';
import { getRoleService } from '@/server/services/org';
import { ThemeGrid } from '@/components/theme/layout/primitives';
import { ThemeCard } from '@/components/theme/cards/theme-card';
import { GradientAccent } from '@/components/theme/primitives/surfaces';

export async function OrgStatsCard() {
    const headerStore = await headers();
    const { authorization } = await getSessionContextOrRedirect({}, {
        headers: headerStore,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'ui:admin:stats',
    });

    const userService = getUserService();
    const [activeUsers, pendingInvites, roles] = await Promise.all([
        userService.countUsersInOrganization({ authorization, filters: { status: 'ACTIVE' } }),
        userService.countUsersInOrganization({ authorization, filters: { status: 'INVITED' } }),
        getRoleService().listRoles({ authorization }),
    ]);

    return (
        <ThemeGrid cols={3} gap="lg">
            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-foreground">{activeUsers}</p>
                            <span className="text-sm font-medium text-green-500">↑ +12%</span>
                        </div>
                    </div>
                    <GradientAccent variant="primary" rounded="lg" className="p-3">
                        <Users className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>

            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-foreground">{pendingInvites}</p>
                        </div>
                    </div>
                    <GradientAccent variant="sunset" rounded="lg" className="p-3">
                        <UserPlus className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>

            <ThemeCard variant="glass" hover="lift" padding="md">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-foreground">{roles.length}</p>
                        </div>
                    </div>
                    <GradientAccent variant="accent" rounded="lg" className="p-3">
                        <KeyRound className="h-5 w-5 text-white" />
                    </GradientAccent>
                </div>
            </ThemeCard>
        </ThemeGrid>
    );
}

export function OrgStatsSkeleton() {
    return (
        <ThemeGrid cols={3} gap="lg">
            {[1, 2, 3].map((index) => (
                <div key={index} className="h-32 animate-pulse bg-muted/20 rounded-xl" />
            ))}
        </ThemeGrid>
    );
}
