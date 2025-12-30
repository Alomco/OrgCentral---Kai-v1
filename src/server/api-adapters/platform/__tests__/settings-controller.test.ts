import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/server/use-cases/auth/sessions/get-session', () => ({
    getSessionContext: vi.fn(() => Promise.resolve({
        authorization: {
            orgId: 'org-1',
            userId: 'admin-1',
            roleKey: 'admin',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            permissions: {
                platformSettings: ['read', 'update'],
            },
        },
    })),
}));

// Mock repositories
const { getSettings, updateSettings } = vi.hoisted(() => ({
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
}));

vi.mock('@/server/repositories/prisma/platform/settings/prisma-enterprise-settings-repository', () => {
    return {
        PrismaEnterpriseSettingsRepository: class {
            getSettings = getSettings;
            updateSettings = updateSettings;
        }
    };
});

import { getEnterpriseSettingsController, updateEnterpriseSettingsController } from '../settings-controller';

function createMockRequest(url: string, method: string = 'GET', body?: unknown) {
    return new Request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
}

describe('settings-controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getEnterpriseSettingsController', () => {
        it('returns settings successfully', async () => {
            const mockSettings = { allowSignups: true };
            getSettings.mockResolvedValue(mockSettings);

            const req = createMockRequest('http://localhost/api/platform/settings');
            const result = await getEnterpriseSettingsController(req);

            expect(result.success).toBe(true);
            expect(result.data.settings).toEqual(mockSettings);
            expect(getSettings).toHaveBeenCalled();
        });
    });

    describe('updateEnterpriseSettingsController', () => {
        it('updates settings successfully', async () => {
            const updates = { allowSignups: false };
            const mockSettings = { allowSignups: false };
            updateSettings.mockResolvedValue(mockSettings);

            const req = createMockRequest('http://localhost/api/platform/settings', 'PATCH', updates);
            const result = await updateEnterpriseSettingsController(req);

            expect(result.success).toBe(true);
            expect(result.data.settings).toEqual(mockSettings);
            expect(updateSettings).toHaveBeenCalledWith(updates);
        });

        it('validation error on invalid types', async () => {
            const updates = { allowSignups: 'invalid-boolean' };
            const req = createMockRequest('http://localhost/api/platform/settings', 'PATCH', updates);

            await expect(updateEnterpriseSettingsController(req)).rejects.toThrow();
        });
    });
});
