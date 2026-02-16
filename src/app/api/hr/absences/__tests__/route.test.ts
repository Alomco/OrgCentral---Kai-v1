import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    getAbsencesController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/absences/get-absences', () => controllers);

import { GET } from '../route';

describe('hr absences route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, absences: [] };
        controllers.getAbsencesController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/absences', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
