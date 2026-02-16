import { beforeEach, describe, expect, it, vi } from 'vitest';

const controllers = vi.hoisted(() => ({
    getHrPolicyRouteController: vi.fn(),
    updateHrPolicyRouteController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/policies/policy-route-controllers', () => controllers);

import { GET, PATCH } from '../route';

describe('policy [policyId] route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 when policyId is missing', async () => {
        const response = await GET(new Request('http://localhost/api/hr/policies/'), {
            params: Promise.resolve({ policyId: '' }),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
            }),
        );
        expect(controllers.getHrPolicyRouteController).not.toHaveBeenCalled();
    });

    it('returns 400 when policyId is missing on PATCH', async () => {
        const response = await PATCH(new Request('http://localhost/api/hr/policies/', { method: 'PATCH' }), {
            params: Promise.resolve({ policyId: '' }),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
            }),
        );
        expect(controllers.updateHrPolicyRouteController).not.toHaveBeenCalled();
    });

    it('returns GET controller payload with no-store cache header', async () => {
        controllers.getHrPolicyRouteController.mockResolvedValue({ success: true, policy: { id: 'p1' } });

        const response = await GET(new Request('http://localhost/api/hr/policies/p1'), {
            params: Promise.resolve({ policyId: 'p1' }),
        });
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(payload).toEqual({ success: true, policy: { id: 'p1' } });
    });

    it('maps syntax errors from PATCH to INVALID_JSON', async () => {
        controllers.updateHrPolicyRouteController.mockRejectedValue(new SyntaxError('Unexpected token'));

        const response = await PATCH(new Request('http://localhost/api/hr/policies/p1', { method: 'PATCH' }), {
            params: Promise.resolve({ policyId: 'p1' }),
        });
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'INVALID_JSON' }),
            }),
        );
    });
});
