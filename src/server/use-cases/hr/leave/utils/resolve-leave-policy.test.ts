import { describe, expect, it } from 'vitest';

import { mapToPolicyType } from './resolve-leave-policy';

describe('mapToPolicyType', () => {
    const cases: Array<{ label: string; expected: string }> = [
        { label: 'Sick Leave', expected: 'SICK' },
        { label: 'illness', expected: 'SICK' },
        { label: 'medical leave', expected: 'SICK' },
        { label: 'Vacation', expected: 'ANNUAL' },
        { label: 'Annual leave', expected: 'ANNUAL' },
        { label: 'holiday', expected: 'ANNUAL' },
        { label: 'Maternity leave', expected: 'MATERNITY' },
        { label: 'Paternity', expected: 'PATERNITY' },
        { label: 'Adoption', expected: 'ADOPTION' },
        { label: 'Unpaid leave', expected: 'UNPAID' },
        { label: 'Leave without pay', expected: 'UNPAID' },
        { label: 'Emergency leave', expected: 'EMERGENCY' },
        { label: 'Random custom label', expected: 'SPECIAL' },
    ];

    for (const testCase of cases) {
        it(`maps "${testCase.label}" to ${testCase.expected}`, () => {
            expect(mapToPolicyType(testCase.label)).toBe(testCase.expected);
        });
    }
});
