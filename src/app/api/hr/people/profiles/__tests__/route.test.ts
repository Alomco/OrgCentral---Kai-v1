import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listProfilesController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/people/profiles-controller', () => controllers);

import { GET } from '../route';

describe('hr people profiles route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, profiles: [] };
        controllers.listProfilesController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/people/profiles', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
