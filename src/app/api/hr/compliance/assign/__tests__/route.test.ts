import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildRequest, expectErrorCode } from '../../__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    assignComplianceItemsController: vi.fn(),
}));

const guards = vi.hoisted(() => ({
    enforceCsrfOriginGuard: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/compliance/assign-compliance-items', () => controllers);
vi.mock('@/server/security/guards/csrf-origin-guard', () => guards);

import { POST } from '../route';

describe('compliance assign route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        guards.enforceCsrfOriginGuard.mockResolvedValue(null);
    });

    it('returns 201 with controller payload', async () => {
        controllers.assignComplianceItemsController.mockResolvedValue({
            success: true,
            templateId: 'd23b1eaf-f51a-4f30-88a1-bd5c3668a55c',
            userCount: 1,
        });

        const response = await POST(buildRequest('http://localhost/api/hr/compliance/assign', 'POST', { a: 1 }));
        const payload = await response.json();

        expect(response.status).toBe(201);
        expect(payload).toEqual({
            success: true,
            templateId: 'd23b1eaf-f51a-4f30-88a1-bd5c3668a55c',
            userCount: 1,
        });
    });

    it('maps malformed JSON to INVALID_JSON envelope', async () => {
        controllers.assignComplianceItemsController.mockRejectedValue(new SyntaxError('Unexpected token'));

        const response = await POST(buildRequest('http://localhost/api/hr/compliance/assign', 'POST'));

        await expectErrorCode(response, 400, 'INVALID_JSON');
    });

    it('returns guard response and skips controller when origin is invalid', async () => {
        guards.enforceCsrfOriginGuard.mockResolvedValue(
            new Response(JSON.stringify({ error: { code: 'AUTHORIZATION_ERROR' } }), {
                status: 403,
                headers: { 'content-type': 'application/json' },
            }),
        );

        const response = await POST(buildRequest('http://localhost/api/hr/compliance/assign', 'POST', { a: 1 }));

        expect(response.status).toBe(403);
        expect(controllers.assignComplianceItemsController).not.toHaveBeenCalled();
    });
});
