import { describe, expect, it } from 'vitest';

import { calculateLeaveBalanceTotals, resolveBalanceYear } from '@/app/(app)/hr/leave/balances/balance-utils';
import type { LeaveBalance } from '@/server/types/leave-types';

const baseBalance: LeaveBalance = {
    id: 'balance-1',
    orgId: 'org-1',
    employeeId: 'emp-1',
    leaveType: 'ANNUAL',
    year: 2025,
    totalEntitlement: 20,
    used: 4,
    pending: 2,
    available: 14,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
};

describe('leave balance utils', () => {
    it('calculates totals for multiple balances', () => {
        const balances: LeaveBalance[] = [
            baseBalance,
            {
                ...baseBalance,
                id: 'balance-2',
                leaveType: 'SICK',
                totalEntitlement: 10,
                used: 1,
                pending: 1,
                available: 8,
            },
        ];

        const totals = calculateLeaveBalanceTotals(balances);
        expect(totals.totalEntitlement).toBe(30);
        expect(totals.used).toBe(5);
        expect(totals.pending).toBe(3);
        expect(totals.available).toBe(22);
    });

    it('falls back to the current year when the query is invalid', () => {
        expect(resolveBalanceYear('invalid', 2026)).toBe(2026);
        expect(resolveBalanceYear('1999', 2026)).toBe(2026);
        expect(resolveBalanceYear(undefined, 2026)).toBe(2026);
    });

    it('accepts a valid year from the query', () => {
        expect(resolveBalanceYear('2025', 2026)).toBe(2025);
        expect(resolveBalanceYear(['2024'], 2026)).toBe(2024);
    });
});
