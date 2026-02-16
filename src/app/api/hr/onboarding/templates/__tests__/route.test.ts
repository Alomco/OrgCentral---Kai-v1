import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listChecklistTemplatesController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/onboarding/templates-controller', () => controllers);

import { GET } from '../route';

describe('hr onboarding templates route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, templates: [] };
        controllers.listChecklistTemplatesController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/onboarding/templates', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
