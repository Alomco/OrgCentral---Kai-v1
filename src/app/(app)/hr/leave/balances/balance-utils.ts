import type { LeaveBalance } from '@/server/types/leave-types';

export interface LeaveBalanceTotals {
    totalEntitlement: number;
    used: number;
    pending: number;
    available: number;
}

export function calculateLeaveBalanceTotals(balances: LeaveBalance[]): LeaveBalanceTotals {
    return balances.reduce<LeaveBalanceTotals>(
        (totals, balance) => {
            totals.totalEntitlement += balance.totalEntitlement;
            totals.used += balance.used;
            totals.pending += balance.pending;
            totals.available += balance.available;
            return totals;
        },
        { totalEntitlement: 0, used: 0, pending: 0, available: 0 },
    );
}

export function resolveBalanceYear(
    value: string | string[] | undefined,
    fallbackYear: number,
): number {
    const candidate = Array.isArray(value) ? value[0] : value;
    const parsed = Number(candidate);
    if (!Number.isFinite(parsed)) {
        return fallbackYear;
    }
    const year = Math.trunc(parsed);
    if (year < 2000 || year > fallbackYear + 2) {
        return fallbackYear;
    }
    return year;
}
