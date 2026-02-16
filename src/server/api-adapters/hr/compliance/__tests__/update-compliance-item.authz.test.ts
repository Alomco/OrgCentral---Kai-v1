import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceLogItem } from '@/server/types/compliance-types';

vi.mock('@/server/use-cases/auth/sessions/get-session', () => ({
    getSessionContext: vi.fn(),
}));

vi.mock('@/server/use-cases/hr/compliance/update-compliance-item', () => ({
    updateComplianceItem: vi.fn(),
}));

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateComplianceItemController } from '../update-compliance-item';
import { updateComplianceItem } from '@/server/use-cases/hr/compliance/update-compliance-item';

function buildAuthorization(userId: string): RepositoryAuthorizationContext {
    return {
        orgId: '85d5bd59-411a-4434-8d9e-164d4607db40',
        userId,
        auditSource: 'test:compliance:update',
        roleKey: 'hrAdmin',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        permissions: {
            organization: ['read', 'update'],
        },
        tenantScope: {
            orgId: '85d5bd59-411a-4434-8d9e-164d4607db40',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test',
        },
    };
}

function buildComplianceLogItem(): ComplianceLogItem {
    return {
        id: '4b28317b-98da-4309-8137-2722e2234cbf',
        orgId: '85d5bd59-411a-4434-8d9e-164d4607db40',
        userId: '22222222-2222-2222-2222-222222222222',
        templateItemId: 'doc-1',
        status: 'PENDING',
        dueDate: null,
        completedAt: null,
        reviewedBy: null,
        reviewedAt: null,
        notes: null,
        attachments: null,
        metadata: null,
        createdAt: new Date('2026-02-15T16:03:53.626Z'),
        updatedAt: new Date('2026-02-15T16:03:53.626Z'),
    };
}

function buildRequest(payload: object): Request {
    return new Request('http://localhost/api/hr/compliance/update', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

const complianceItemRepository = {
    assignItems: vi.fn(),
    getItem: vi.fn(),
    listItemsForUser: vi.fn(),
    listItemsForOrg: vi.fn(),
    listPendingReviewItemsForOrg: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    findExpiringItemsForOrg: vi.fn(),
};

const complianceTemplateRepository = {
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    getTemplate: vi.fn(),
    listTemplates: vi.fn(),
};

describe('updateComplianceItemController authorization boundaries', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('requires elevated permissions for cross-user updates', async () => {
        vi.mocked(getSessionContext)
            .mockResolvedValueOnce({
                authorization: buildAuthorization('11111111-1111-4111-8111-111111111111'),
                session: { session: { userId: '11111111-1111-4111-8111-111111111111' } },
            } as never)
            .mockRejectedValueOnce(
                new AuthorizationError('Forbidden', { reason: 'forbidden' }),
            );

        await expect(
            updateComplianceItemController(
                buildRequest({
                    userId: '22222222-2222-4222-8222-222222222222',
                    itemId: '4b28317b-98da-4309-8137-2722e2234cbf',
                    updates: { notes: 'attempted cross-user write' },
                }),
                {
                    session: {},
                    complianceItemRepository,
                    complianceTemplateRepository,
                },
            ),
        ).rejects.toBeInstanceOf(AuthorizationError);

        expect(updateComplianceItem).not.toHaveBeenCalled();
        expect(getSessionContext).toHaveBeenCalledTimes(2);
    });

    it('applies reviewer metadata when elevated update succeeds', async () => {
        vi.mocked(getSessionContext)
            .mockResolvedValueOnce({
                authorization: buildAuthorization('11111111-1111-4111-8111-111111111111'),
                session: { session: { userId: '11111111-1111-4111-8111-111111111111' } },
            } as never)
            .mockResolvedValueOnce({
                authorization: buildAuthorization('33333333-3333-4333-8333-333333333333'),
                session: { session: { userId: '33333333-3333-4333-8333-333333333333' } },
            } as never);

        vi.mocked(updateComplianceItem).mockResolvedValue(buildComplianceLogItem());

        const result = await updateComplianceItemController(
            buildRequest({
                userId: '22222222-2222-4222-8222-222222222222',
                itemId: '4b28317b-98da-4309-8137-2722e2234cbf',
                updates: { notes: 'approved by manager' },
            }),
            {
                session: {},
                complianceItemRepository,
                complianceTemplateRepository,
            },
        );

        expect(result).toEqual({
            success: true,
            itemId: '4b28317b-98da-4309-8137-2722e2234cbf',
        });

        expect(updateComplianceItem).toHaveBeenCalledTimes(1);
        const call = vi.mocked(updateComplianceItem).mock.calls[0]?.[1];
        expect(call?.updates.reviewedBy).toBe('33333333-3333-4333-8333-333333333333');
        expect(call?.updates.reviewedAt).toBeInstanceOf(Date);
    });
});
