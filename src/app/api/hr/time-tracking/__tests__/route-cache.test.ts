import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listTimeEntriesRouteController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/time-tracking/time-tracking-route-controllers', () => controllers);

import { GET } from '../route';

describe('hr time-tracking route cache hardening', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, entries: [] };
        controllers.listTimeEntriesRouteController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/time-tracking', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
