import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

const listSupportTicketsServiceMock = vi.fn();
const registerCacheTagMock = vi.fn();
const cacheLifeMock = vi.fn();
const noStoreMock = vi.fn();

vi.mock('@/server/services/platform/admin/support-ticket-service', () => ({
    listSupportTicketsService: (...args: unknown[]) => listSupportTicketsServiceMock(...args),
}));

vi.mock('@/server/lib/cache-tags', () => ({
    registerCacheTag: (...args: unknown[]) => registerCacheTagMock(...args),
}));

vi.mock('next/cache', () => ({
    cacheLife: (...args: unknown[]) => cacheLifeMock(...args),
    unstable_noStore: (...args: unknown[]) => noStoreMock(...args),
}));

import { loadSupportTicketsForUi } from '../support-ticket-page-store';

describe('support-ticket-page-store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        listSupportTicketsServiceMock.mockResolvedValue([]);
    });

    it('uses cache-safe authorization in cached path', async () => {
        const authorization = buildAuthorization('OFFICIAL', '12345678-1234-4234-8234-123456789012');
        await loadSupportTicketsForUi(authorization);

        expect(listSupportTicketsServiceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                correlationId: '00000000-0000-0000-0000-000000000000',
            }),
        );
        expect(registerCacheTagMock).toHaveBeenCalled();
    });

    it('keeps live authorization context for non-official classification', async () => {
        const authorization = buildAuthorization('OFFICIAL_SENSITIVE', 'abcdefab-cdef-4def-8def-abcdefabcdef');
        await loadSupportTicketsForUi(authorization);

        expect(listSupportTicketsServiceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                correlationId: authorization.correlationId,
            }),
        );
    });
});

function buildAuthorization(
    dataClassification: RepositoryAuthorizationContext['dataClassification'],
    correlationId: string,
): RepositoryAuthorizationContext {
    const now = new Date('2026-02-01T00:00:00.000Z');
    return {
        orgId: '11111111-1111-4111-8111-111111111111',
        userId: '99999999-9999-4999-8999-999999999999',
        roleKey: 'globalAdmin',
        permissions: { platformSupport: ['read'] },
        dataResidency: 'UK_ONLY',
        dataClassification,
        auditSource: 'test',
        tenantScope: {
            orgId: '11111111-1111-4111-8111-111111111111',
            dataResidency: 'UK_ONLY',
            dataClassification,
            auditSource: 'test',
        },
        auditBatchId: undefined,
        mfaVerified: true,
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        authenticatedAt: now,
        sessionExpiresAt: new Date(now.getTime() + 60_000),
        lastActivityAt: now,
        sessionId: 'session',
        sessionToken: 'token',
        correlationId,
        authorizedAt: now,
        authorizationReason: 'test',
    };
}
