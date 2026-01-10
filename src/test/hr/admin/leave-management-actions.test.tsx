// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/app/(app)/hr/admin/_components/leave-delegation-control', () => ({
    LeaveDelegationControl: () => <div data-testid="delegation-placeholder" />,
}));

import { LeaveManagementActions } from '@/app/(app)/hr/admin/_components/leave-management-actions';

describe('LeaveManagementActions', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('disables export when no rows are available', async () => {
        render(<LeaveManagementActions requests={[]} delegateFor={null} />);

        const exportButton = screen.getByRole('button', { name: /export csv/i }) as HTMLButtonElement;
        expect(exportButton.disabled).toBe(true);

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /apply/i }));
        // No errors should surface when clicking apply without data
    });

    it('exports CSV and revokes blob URLs when rows exist', async () => {
        const createObjectURL = vi.fn().mockReturnValue('blob:leave-requests');
        const revokeObjectURL = vi.fn();
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        vi.spyOn(URL, 'createObjectURL').mockImplementation(createObjectURL);
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revokeObjectURL);

        const sampleRows = [
            {
                employeeName: 'Ada Lovelace',
                leaveType: 'ANNUAL',
                startDate: '2025-01-01',
                endDate: '2025-01-02',
                totalDays: 2,
                status: 'submitted',
                submittedAt: '2025-01-01T10:00:00Z',
            },
        ];

        render(<LeaveManagementActions requests={sampleRows} delegateFor={null} />);

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /export csv/i }));

        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(click).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    });
});
