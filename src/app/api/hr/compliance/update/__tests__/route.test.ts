import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationError } from '@/server/errors';

import { buildRequest, expectErrorCode } from '../../__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    updateComplianceItemController: vi.fn(),
}));

const guards = vi.hoisted(() => ({
    enforceCsrfOriginGuard: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/compliance/update-compliance-item', () => controllers);
vi.mock('@/server/security/guards/csrf-origin-guard', () => guards);

import { PATCH } from '../route';

describe('compliance update route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        guards.enforceCsrfOriginGuard.mockResolvedValue(null);
    });

    it('returns 200 with controller payload', async () => {
        controllers.updateComplianceItemController.mockResolvedValue({
            success: true,
            itemId: '4b28317b-98da-4309-8137-2722e2234cbf',
        });

        const response = await PATCH(buildRequest('http://localhost/api/hr/compliance/update', 'PATCH', { a: 1 }));
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            success: true,
            itemId: '4b28317b-98da-4309-8137-2722e2234cbf',
        });
    });

    it('maps authorization failures to AUTHORIZATION_ERROR envelope', async () => {
        controllers.updateComplianceItemController.mockRejectedValue(
            new AuthorizationError('Forbidden', { reason: 'forbidden' }),
        );

        const response = await PATCH(buildRequest('http://localhost/api/hr/compliance/update', 'PATCH', { a: 1 }));

        await expectErrorCode(response, 403, 'AUTHORIZATION_ERROR');
    });

    it('returns guard response and skips controller when origin is invalid', async () => {
        guards.enforceCsrfOriginGuard.mockResolvedValue(
            new Response(JSON.stringify({ error: { code: 'AUTHORIZATION_ERROR' } }), {
                status: 403,
                headers: { 'content-type': 'application/json' },
            }),
        );

        const response = await PATCH(buildRequest('http://localhost/api/hr/compliance/update', 'PATCH', { a: 1 }));

        expect(response.status).toBe(403);
        expect(controllers.updateComplianceItemController).not.toHaveBeenCalled();
    });
});
