import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildRequest, expectErrorCode } from '../../__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listPendingReviewComplianceItemsController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/compliance/list-pending-review-items', () => controllers);

import { GET } from '../route';

describe('compliance review-queue route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 with no-store header on GET', async () => {
        controllers.listPendingReviewComplianceItemsController.mockResolvedValue({
            success: true,
            items: [],
        });

        const response = await GET(buildRequest('http://localhost/api/hr/compliance/review-queue', 'GET'));
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(payload).toEqual({ success: true, items: [] });
    });

    it('maps malformed JSON errors to INVALID_JSON envelope when bubbling', async () => {
        controllers.listPendingReviewComplianceItemsController.mockRejectedValue(new SyntaxError('Unexpected token'));

        const response = await GET(buildRequest('http://localhost/api/hr/compliance/review-queue', 'GET'));

        await expectErrorCode(response, 400, 'INVALID_JSON');
    });
});
