import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AbsenceTypeConfig } from '@/server/types/hr-ops-types';
import { getEmployeeProfileByUserForUi } from '@/server/use-cases/hr/people/get-employee-profile-by-user.cached';
import { getLeaveBalanceForUi } from '@/server/use-cases/hr/leave/get-leave-balance.cached';

interface AbsenceBalanceCardsProps {
    authorization: RepositoryAuthorizationContext;
    absenceTypes: AbsenceTypeConfig[];
}

function toNumber(value: number | { toNumber?: () => number } | null | undefined): number {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === 'object' && typeof value.toNumber === 'function') {
        return value.toNumber();
    }
    return Number(value);
}

function formatDays(value: number): string {
    return `${value.toLocaleString()} days`;
}

export async function AbsenceBalanceCards({ authorization, absenceTypes }: AbsenceBalanceCardsProps) {
    const trackedTypes = absenceTypes.filter((type) => type.tracksBalance && type.isActive);

    if (trackedTypes.length === 0) {
        return null;
    }

    const profileResult = await getEmployeeProfileByUserForUi({
        authorization,
        userId: authorization.userId,
    }).catch(() => ({ profile: null }));

    const employeeNumber = profileResult.profile?.employeeNumber ?? null;

    const balancesResult = employeeNumber
        ? await getLeaveBalanceForUi({ authorization, employeeId: employeeNumber }).catch(() => ({ balances: [] }))
        : { balances: [] };

    if (!employeeNumber) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Absence balances</CardTitle>
                    <CardDescription>
                        Absence balances are unavailable until an employee profile is linked.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Ask your HR administrator to complete your employee profile before tracking balances.
                </CardContent>
            </Card>
        );
    }

    const balanceLookup = new Map(
        balancesResult.balances.map((balance) => [balance.leaveType, balance] as const),
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trackedTypes.map((type) => {
                const balance = balanceLookup.get(type.key);
                const available = balance ? toNumber(balance.available) : 0;
                const used = balance ? toNumber(balance.used) : 0;
                const entitlement = balance ? toNumber(balance.totalEntitlement) : 0;

                return (
                    <Card key={type.id} className="border-border/60 bg-background/60">
                        <CardHeader className="space-y-1">
                            <CardDescription>{type.label}</CardDescription>
                            <CardTitle className="text-2xl font-semibold">
                                {balance ? formatDays(available) : 'Not tracked'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-1">
                            {balance ? (
                                <>
                                    <div>Entitlement: {formatDays(entitlement)}</div>
                                    <div>Used: {formatDays(used)}</div>
                                </>
                            ) : (
                                <div>No leave balance record found for this absence type.</div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
