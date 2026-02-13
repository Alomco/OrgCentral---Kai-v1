import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictError } from '@/server/errors';

const controllers = vi.hoisted(() => ({
    listSupportTicketsController: vi.fn(),
    createSupportTicketController: vi.fn(),
    updateSupportTicketController: vi.fn(),
}));

vi.mock('@/server/api-adapters/platform/admin/support-tickets-controller', () => controllers);

import { GET, PATCH, POST } from '../route';

describe('support tickets route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('maps malformed JSON parse errors to 400', async () => {
        controllers.createSupportTicketController.mockRejectedValue(new SyntaxError('Unexpected token'));

        const response = await POST(new Request('http://localhost/api/platform/admin/support-tickets', { method: 'POST' }));
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'INVALID_JSON' }),
            }),
        );
    });

    it('maps optimistic concurrency conflicts to 409', async () => {
        controllers.updateSupportTicketController.mockRejectedValue(
            new ConflictError('Support ticket was updated by another operation. Refresh and retry.'),
        );

        const response = await PATCH(new Request('http://localhost/api/platform/admin/support-tickets', { method: 'PATCH' }));
        const payload = await response.json();

        expect(response.status).toBe(409);
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'CONFLICT_ERROR' }),
            }),
        );
    });

    it('returns GET response from controller', async () => {
        controllers.listSupportTicketsController.mockResolvedValue({ success: true, data: [] });

        const response = await GET(new Request('http://localhost/api/platform/admin/support-tickets', { method: 'GET' }));
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({ success: true, data: [] });
    });
});
