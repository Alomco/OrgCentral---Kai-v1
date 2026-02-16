import { beforeEach, describe, it, vi } from 'vitest';

import { expectNoStoreJsonResponse } from '@/app/api/hr/__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listDocumentsController: vi.fn(),
}));

vi.mock('@/server/api-adapters/records/documents/list-documents', () => controllers);

import { GET } from '../route';

describe('hr documents route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns no-store GET payload', async () => {
        const payload = { success: true, documents: [] };
        controllers.listDocumentsController.mockResolvedValue(payload);

        const response = await GET(new Request('http://localhost/api/hr/documents', { method: 'GET' }));
        await expectNoStoreJsonResponse(response, 200, payload);
    });
});
