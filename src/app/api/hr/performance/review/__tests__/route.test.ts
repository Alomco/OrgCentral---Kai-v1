import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listPerformanceReviewsRouteController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/performance/review-route-controllers', () => controllers);

import { GET } from '../route';

describe('hr performance review route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, reviews: [] };
        controllers.listPerformanceReviewsRouteController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/performance/review', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
