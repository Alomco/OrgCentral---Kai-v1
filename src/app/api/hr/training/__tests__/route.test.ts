import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listTrainingRecordsRouteController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/training/training-route-controllers', () => controllers);

import { GET } from '../route';

describe('hr training route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, records: [] };
        controllers.listTrainingRecordsRouteController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/training', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
