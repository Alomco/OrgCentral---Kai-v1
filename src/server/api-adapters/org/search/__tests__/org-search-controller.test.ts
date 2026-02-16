import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { AuthorizationError } from '@/server/errors';
import { listOrgTopbarSearchController } from '../org-search-controller';

vi.mock('@/server/use-cases/auth/sessions/get-session', () => ({
    getSessionContext: vi.fn(),
}));

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';

function buildAuthorizationContext(orgId: string): RepositoryAuthorizationContext {
    const tenantScope = {
        orgId,
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test:api:org:search',
    } as const;

    return {
        ...tenantScope,
        tenantScope,
        permissions: {},
        roleKey: 'owner',
        userId: 'user-1',
    };
}

describe('listOrgTopbarSearchController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('enforces org-scoped authorization and delegates to people service', async () => {
        const authorization = buildAuthorizationContext('org-1');
        vi.mocked(getSessionContext).mockResolvedValue({
            authorization,
            session: {
                session: {
                    id: 'session-1',
                    token: 'token-1',
                    userId: 'user-1',
                    activeOrganizationId: 'org-1',
                    createdAt: new Date('2026-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                    expiresAt: new Date('2026-01-01T01:00:00.000Z'),
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                },
                user: {
                    id: 'user-1',
                    email: 'user@example.com',
                    name: 'User Test',
                    createdAt: new Date('2026-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                    emailVerified: true,
                    twoFactorEnabled: false,
                    image: null,
                    displayUsername: null,
                },
            },
        });

        const listEmployeeProfiles = vi.fn().mockResolvedValue({
            profiles: [
                {
                    id: 'profile-1',
                    orgId: 'org-1',
                    userId: 'user-1',
                    employeeNumber: 'EMP-001',
                    displayName: 'Ada Lovelace',
                    email: 'ada@org.example',
                    departmentId: 'Engineering',
                    jobTitle: 'Engineer',
                    employmentStatus: 'ACTIVE',
                    employmentType: 'FULL_TIME',
                    healthStatus: 'UNDEFINED',
                    createdAt: new Date('2026-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
                },
            ],
        });

        const request = new Request('http://localhost/api/org/org-1/search?q=Ada&limit=5');
        const result = await listOrgTopbarSearchController(request, 'org-1', {
            peopleService: { listEmployeeProfiles },
        });

        expect(getSessionContext).toHaveBeenCalledWith(
            {},
            expect.objectContaining({
                orgId: 'org-1',
                requiredPermissions: { employeeProfile: ['list'] },
                auditSource: 'api:org:search:topbar',
            }),
        );
        expect(listEmployeeProfiles).toHaveBeenCalledWith(
            expect.objectContaining({
                authorization,
                payload: { filters: { search: 'Ada' }, limit: 25 },
            }),
        );
        expect(result.results).toHaveLength(1);
        expect(result.results[0].title).toBe('Ada Lovelace');
    });

    it('rejects invalid query input before touching authorization', async () => {
        const request = new Request('http://localhost/api/org/org-1/search?q=x');

        await expect(listOrgTopbarSearchController(request, 'org-1')).rejects.toThrowError();
        expect(getSessionContext).not.toHaveBeenCalled();
    });

    it('propagates authorization errors and does not call people service', async () => {
        vi.mocked(getSessionContext).mockRejectedValue(
            new AuthorizationError('Forbidden', { reason: 'missing_permissions' }),
        );

        const listEmployeeProfiles = vi.fn();
        const request = new Request('http://localhost/api/org/org-1/search?q=Ada&limit=5');

        await expect(
            listOrgTopbarSearchController(request, 'org-1', {
                peopleService: { listEmployeeProfiles },
            }),
        ).rejects.toBeInstanceOf(AuthorizationError);
        expect(listEmployeeProfiles).not.toHaveBeenCalled();
    });
});
