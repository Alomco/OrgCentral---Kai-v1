import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationError } from '@/server/errors';

import { buildRequest, expectErrorCode } from '../../__tests__/route-test-helpers';

const controllers = vi.hoisted(() => ({
    listComplianceCategoriesController: vi.fn(),
    upsertComplianceCategoryController: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/compliance/list-compliance-categories', () => ({
    listComplianceCategoriesController: controllers.listComplianceCategoriesController,
}));

vi.mock('@/server/api-adapters/hr/compliance/upsert-compliance-category', () => ({
    upsertComplianceCategoryController: controllers.upsertComplianceCategoryController,
}));

import { GET, PUT } from '../route';

describe('compliance categories route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 200 with no-store header on GET', async () => {
        controllers.listComplianceCategoriesController.mockResolvedValue({
            success: true,
            categories: [],
        });

        const response = await GET(buildRequest('http://localhost/api/hr/compliance/categories', 'GET'));
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(payload).toEqual({ success: true, categories: [] });
    });

    it('maps auth failures on PUT to AUTHORIZATION_ERROR envelope', async () => {
        controllers.upsertComplianceCategoryController.mockRejectedValue(new AuthorizationError('Forbidden', { reason: 'forbidden' }));

        const response = await PUT(buildRequest('http://localhost/api/hr/compliance/categories', 'PUT', { key: 'k', label: 'l' }));

        await expectErrorCode(response, 403, 'AUTHORIZATION_ERROR');
    });
});
