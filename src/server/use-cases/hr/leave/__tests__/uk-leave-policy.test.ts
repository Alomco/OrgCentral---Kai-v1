import { describe, it, expect } from 'vitest';
import { checkUkDefaultLeavePolicy } from '@/server/domain/leave/uk-leave-policy';

describe('checkUkDefaultLeavePolicy', () => {
    it('blocks when max span exceeded', () => {
        const result = checkUkDefaultLeavePolicy({
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-02-05'),
            totalDays: 35,
            existingRequests: [],
        });
        expect(result.blocking.some((b) => b.code === 'max-span')).toBe(true);
    });

    it('warns on bank holidays', () => {
        const result = checkUkDefaultLeavePolicy({
            startDate: new Date('2026-12-25'),
            endDate: new Date('2026-12-26'),
            totalDays: 2,
            existingRequests: [],
            bankHolidays: ['2026-12-25', '2026-12-26'],
        });
        expect(result.warnings.some((w) => w.code === 'bank-holiday')).toBe(true);
    });
});
