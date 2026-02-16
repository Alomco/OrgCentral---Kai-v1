import { describe, expect, it } from 'vitest';

import { AuthorizationError } from '@/server/errors';
import type { AuthSession } from '@/server/lib/auth';
import { buildOrgAccessInputFromSession } from '../session-access';

const VALID_USER_ID = '11111111-1111-4111-8111-111111111111';
const VALID_ORG_ID = '22222222-2222-4222-8222-222222222222';

function createSession(input: {
    userId?: string;
    nestedUserId?: string;
    sessionUserId?: string;
    activeOrganizationId?: string;
    organizationId?: string;
}): AuthSession {
    const now = new Date('2026-02-14T00:00:00.000Z');
    const resolvedSessionUserId = input.sessionUserId ?? input.userId ?? VALID_USER_ID;
    const resolvedUserId = input.userId ?? resolvedSessionUserId;

    return {
        user: {
            id: resolvedUserId,
            email: 'security-test@example.com',
            name: 'Security Test User',
            image: null,
            emailVerified: true,
            twoFactorEnabled: false,
            createdAt: now,
            updatedAt: now,
        },
        session: {
            id: 'session-id',
            createdAt: now,
            updatedAt: now,
            expiresAt: new Date('2026-02-15T00:00:00.000Z'),
            token: 'token-id',
            userId: resolvedSessionUserId,
            user: {
                id: input.nestedUserId,
            },
            activeOrganizationId: input.activeOrganizationId,
            organizationId: input.organizationId,
        },
    } as AuthSession;
}

describe('buildOrgAccessInputFromSession', () => {
    it('accepts valid session identifiers and returns auth input', () => {
        const session = createSession({
            userId: VALID_USER_ID,
            activeOrganizationId: VALID_ORG_ID,
        });

        const result = buildOrgAccessInputFromSession(session, {
            requiredPermissions: { organization: ['read'] },
        });

        expect(result).toMatchObject({
            userId: VALID_USER_ID,
            orgId: VALID_ORG_ID,
            requiredPermissions: { organization: ['read'] },
        });
    });

    it('uses session.session.userId when session.user.id is unavailable', () => {
        const session = createSession({
            sessionUserId: VALID_USER_ID,
            activeOrganizationId: VALID_ORG_ID,
        });

        const result = buildOrgAccessInputFromSession(session, {});

        expect(result.userId).toBe(VALID_USER_ID);
        expect(result.orgId).toBe(VALID_ORG_ID);
    });

    it('throws AuthorizationError when org id is invalid', () => {
        const session = createSession({
            userId: VALID_USER_ID,
            activeOrganizationId: VALID_ORG_ID,
        });

        const error = captureAuthorizationError(() =>
            buildOrgAccessInputFromSession(session, { orgId: 'not-a-uuid' }),
        );

        expect(error.details).toMatchObject({
            reason: 'invalid_session_identity',
            field: 'orgId',
            source: 'request.orgId',
        });
    });

    it('throws AuthorizationError when user id is missing', () => {
        const session = createSession({
            userId: '',
            sessionUserId: '',
            activeOrganizationId: VALID_ORG_ID,
        });

        const error = captureAuthorizationError(() => buildOrgAccessInputFromSession(session, {}));

        expect(error.details).toMatchObject({
            reason: 'unauthenticated',
            field: 'userId',
        });
    });
});

function captureAuthorizationError(handler: () => void): AuthorizationError {
    try {
        handler();
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return error;
        }
        throw error;
    }

    throw new Error('Expected AuthorizationError to be thrown.');
}
