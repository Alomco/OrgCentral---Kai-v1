import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    getLeaveRequestsController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/leave/get-leave-requests', () => controllers);

import { GET } from '../route';

describe('hr leave route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, requests: [] };
        controllers.getLeaveRequestsController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/leave', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
