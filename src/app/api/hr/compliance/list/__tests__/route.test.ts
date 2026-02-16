import { beforeEach, describe, expect, it, vi } from 'vitest';

const controllers = vi.hoisted(() => ({
    listComplianceItemsController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/compliance/list-compliance-items', () => controllers);

import { GET } from '../route';

describe('compliance list route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns list payload with no-store cache header', async () => {
        controllers.listComplianceItemsController.mockResolvedValue({ success: true, items: [] });

        const response = await GET(new Request('http://localhost/api/hr/compliance/list', { method: 'GET' }));
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(payload).toEqual({ success: true, items: [] });
    });

    it('maps malformed JSON parse errors to INVALID_JSON', async () => {
        controllers.listComplianceItemsController.mockRejectedValue(new SyntaxError('Unexpected token'));

        const response = await GET(new Request('http://localhost/api/hr/compliance/list', { method: 'GET' }));
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'INVALID_JSON' }),
            }),
        );
    });
});
