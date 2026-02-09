import { describe, expect, it } from 'vitest';

import {
    leaveBalanceQuerySchema,
    submitLeaveRequestSchema,
} from '@/server/types/hr-leave-schemas';

describe('hr leave schemas', () => {
    it('accepts employee numbers for submit payloads', () => {
        const parsed = submitLeaveRequestSchema.parse({
            employeeId: 'ME-001',
            employeeName: 'No Man',
            leaveType: 'ANNUAL',
            startDate: '2026-02-17T00:00:00.000Z',
            endDate: '2026-02-18T00:00:00.000Z',
            totalDays: 2,
            isHalfDay: false,
        });

        expect(parsed.employeeId).toBe('ME-001');
    });

    it('allows balances query without employeeId and with employee numbers', () => {
        expect(leaveBalanceQuerySchema.parse({ year: '2026' })).toEqual({ year: 2026 });

        const withEmployeeNumber = leaveBalanceQuerySchema.parse({
            employeeId: 'ME-001',
            year: '2026',
        });

        expect(withEmployeeNumber.employeeId).toBe('ME-001');
        expect(withEmployeeNumber.year).toBe(2026);
    });
});
