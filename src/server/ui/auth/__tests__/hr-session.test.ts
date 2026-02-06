import { describe, expect, it, vi } from 'vitest';

import type { GetSessionResult } from '@/server/use-cases/auth/sessions/get-session';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AuthSession } from '@/server/lib/auth';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import {
    buildHrAuthActionOptions,
    getHrSessionContextOrRedirect,
    getOptionalHrAuthorization,
} from '@/server/ui/auth/hr-session';

const mockGetSessionContext = vi.fn();
const mockGetSessionContextOrRedirect = vi.fn();

vi.mock('@/server/use-cases/auth/sessions/get-session', () => ({
    getSessionContext: (deps: object, input: object) => mockGetSessionContext(deps, input),
}));

vi.mock('@/server/ui/auth/session-redirect', () => ({
    getSessionContextOrRedirect: (deps: object, input: object, options?: object) =>
        mockGetSessionContextOrRedirect(deps, input, options),
}));

const buildAuthorizationContext = (): RepositoryAuthorizationContext => ({
    orgId: 'org-1',
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test',
    userId: 'user-1',
    permissions: {},
    roleKey: 'custom',
    tenantScope: {
        orgId: 'org-1',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
    },
} as RepositoryAuthorizationContext);

const buildAuthSession = (): NonNullable<AuthSession> => ({
    session: {
        id: 'session-1',
        token: 'token-1',
        userId: 'user-1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        expiresAt: new Date('2026-01-01T00:00:00Z'),
        activeOrganizationId: 'org-1',
        ipAddress: null,
        userAgent: null,
    },
    user: {
        id: 'user-1',
        email: 'user@example.com',
        emailVerified: true,
        name: 'Test User',
        image: null,
        twoFactorEnabled: false,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
    },
});

const buildSessionResult = (): GetSessionResult => ({
    session: buildAuthSession(),
    authorization: buildAuthorizationContext(),
});

describe('hr-session helpers', () => {
    it('buildHrAuthActionOptions maps access input', () => {
        const options = buildHrAuthActionOptions({
            requiredPermissions: HR_PERMISSION_PROFILE.PROFILE_READ,
            auditSource: 'ui:hr:profile',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
            resourceAttributes: { scope: 'self' },
            correlationId: 'corr-1',
        });

        expect(options).toEqual({
            requiredPermissions: HR_PERMISSION_PROFILE.PROFILE_READ,
            requiredAnyPermissions: undefined,
            expectedClassification: undefined,
            expectedResidency: undefined,
            auditSource: 'ui:hr:profile',
            correlationId: 'corr-1',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
            resourceAttributes: { scope: 'self' },
        });
    });

    it('getHrSessionContextOrRedirect passes through inputs', async () => {
        const result = buildSessionResult();
        mockGetSessionContextOrRedirect.mockResolvedValue(result);

        const access = {
            headers: new Headers(),
            requiredPermissions: HR_PERMISSION_PROFILE.PROFILE_READ,
            auditSource: 'ui:hr:profile',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
        };

        const response = await getHrSessionContextOrRedirect({}, access);

        expect(response).toBe(result);
        expect(mockGetSessionContextOrRedirect).toHaveBeenCalledWith({}, access, undefined);
    });

    it('getOptionalHrAuthorization returns null on failure', async () => {
        const result = buildSessionResult();
        mockGetSessionContext.mockResolvedValueOnce(result);

        const access = {
            headers: new Headers(),
            requiredPermissions: HR_PERMISSION_PROFILE.PROFILE_READ,
            auditSource: 'ui:hr:profile',
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
        };

        const authorization = await getOptionalHrAuthorization({}, access);
        expect(authorization).toEqual(result.authorization);

        mockGetSessionContext.mockRejectedValueOnce(new Error('no access'));
        const denied = await getOptionalHrAuthorization({}, access);
        expect(denied).toBeNull();
    });
});
