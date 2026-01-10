// @vitest-environment jsdom

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

vi.mock('@/app/(app)/hr/leave/actions', () => ({ submitLeaveRequestAction: vi.fn() }));

import { LeaveRequestForm } from '@/app/(app)/hr/leave/_components/leave-request-form';
import type { LeaveRequestFormState } from '@/app/(app)/hr/leave/form-state';

const baseState: LeaveRequestFormState = {
    status: 'idle',
    values: {
        leaveType: 'ANNUAL',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        totalDays: 2,
        isHalfDay: false,
        reason: 'family',
    },
};

function createFile(name: string, type: string, content = 'stub'): File {
    return new File([content], name, { type });
}

function mockCrypto() {
    if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { webcrypto } = require('node:crypto');
        Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    }
}

describe('LeaveRequestForm attachments', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        mockCrypto();
        if (typeof globalThis.ResizeObserver === 'undefined') {
            class MockResizeObserver {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            Object.defineProperty(globalThis, 'ResizeObserver', {
                value: MockResizeObserver,
                configurable: true,
            });
        }
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uploads an attachment and surfaces success state', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ uploadUrl: 'https://upload.example', storageKey: 'key-123', headers: { 'x-ms-blob-type': 'BlockBlob' } }),
                text: async () => '',
            })
            .mockResolvedValueOnce({ ok: true, text: async () => '' });

        globalThis.fetch = fetchMock as unknown as typeof fetch;
        render(<LeaveRequestForm initialState={baseState} policySummary={undefined} balances={[]} />);

        const fileInput = screen.getByLabelText(/attachments/i);
        const file = createFile('evidence.pdf', 'application/pdf');
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.queryByText(/evidence\.pdf uploaded\./i)).not.toBeNull();
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const [, presignInit] = fetchMock.mock.calls[0] ?? [];
        const body = presignInit && typeof presignInit === 'object' ? (presignInit as RequestInit).body : null;
        expect(typeof body).toBe('string');
        if (typeof body === 'string') {
            const payload = JSON.parse(body) as { fileName?: string; contentType?: string };
            expect(payload.fileName).toBe('evidence.pdf');
            expect(payload.contentType).toBe('application/pdf');
        }
    });

    it('surfaces an error when presign fails', async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, text: async () => 'server error' });
        globalThis.fetch = fetchMock as unknown as typeof fetch;
        render(<LeaveRequestForm initialState={baseState} policySummary={undefined} balances={[]} />);

        const fileInput = screen.getByLabelText(/attachments/i);
        const file = createFile('broken.pdf', 'application/pdf');
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.queryByText(/server error/i)).not.toBeNull();
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
