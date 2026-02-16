import { beforeEach, describe, expect, it, vi } from 'vitest';

import { approveLeaveRequestController } from '@/server/api-adapters/hr/leave/approve-leave-request';
import { rejectLeaveRequestController } from '@/server/api-adapters/hr/leave/reject-leave-request';
import { cancelLeaveRequestController } from '@/server/api-adapters/hr/leave/cancel-leave-request';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { readJson, resolveLeaveControllerDependencies } from '@/server/api-adapters/hr/leave/common';

vi.mock('@/server/use-cases/auth/sessions/get-session', () => ({
    getSessionContext: vi.fn(),
}));

vi.mock('@/server/api-adapters/http/session-helpers', () => ({
    requireSessionUser: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/leave/common', () => ({
    readJson: vi.fn(),
    defaultLeaveControllerDependencies: {},
    resolveLeaveControllerDependencies: vi.fn(),
}));

const approveLeaveRequestMock = vi.fn();
const rejectLeaveRequestMock = vi.fn();
const cancelLeaveRequestMock = vi.fn();

const getSessionContextMock = vi.mocked(getSessionContext);
const requireSessionUserMock = vi.mocked(requireSessionUser);
const readJsonMock = vi.mocked(readJson);
const resolveLeaveControllerDependenciesMock = vi.mocked(resolveLeaveControllerDependencies);

function buildAuthorization() {
    return {
        orgId: 'org-1',
        userId: 'session-user',
        roleKey: 'orgAdmin',
        permissions: {},
        dataResidency: 'UK_ONLY' as const,
        dataClassification: 'OFFICIAL' as const,
        auditSource: 'test',
        tenantScope: {
            orgId: 'org-1',
            dataResidency: 'UK_ONLY' as const,
            dataClassification: 'OFFICIAL' as const,
            auditSource: 'test',
            auditBatchId: undefined,
        },
        correlationId: 'corr-1',
    };
}

describe('leave controllers actor integrity', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getSessionContextMock.mockResolvedValue({
            session: { user: { id: 'session-user' } },
            authorization: buildAuthorization(),
        } as never);

        requireSessionUserMock.mockReturnValue({ userId: 'session-user' });

        resolveLeaveControllerDependenciesMock.mockReturnValue({
            session: {},
            service: {
                approveLeaveRequest: approveLeaveRequestMock,
                rejectLeaveRequest: rejectLeaveRequestMock,
                cancelLeaveRequest: cancelLeaveRequestMock,
            },
            absenceSettingsRepository: {},
        } as never);

        approveLeaveRequestMock.mockResolvedValue({ success: true, requestId: 'req-1', approvedAt: '2026-02-13T10:00:00.000Z', decisionContext: { requestId: 'req-1' } });
        rejectLeaveRequestMock.mockResolvedValue({ success: true, requestId: 'req-1', rejectedAt: '2026-02-13T10:00:00.000Z', decisionContext: { requestId: 'req-1' } });
        cancelLeaveRequestMock.mockResolvedValue({ success: true, requestId: 'req-1', cancelledAt: '2026-02-13T10:00:00.000Z' });
    });

    it('uses session user for approve even when payload includes approverId', async () => {
        readJsonMock.mockResolvedValue({ approverId: '11111111-1111-4111-8111-111111111111', comments: 'ok' });

        await approveLeaveRequestController({ request: new Request('http://localhost/api/hr/leave/req-1/approve', { method: 'POST' }), requestId: 'req-1' });

        expect(approveLeaveRequestMock).toHaveBeenCalledWith(expect.objectContaining({
            requestId: 'req-1',
            approverId: 'session-user',
        }));
    });

    it('uses session user for reject even when payload includes rejectedBy', async () => {
        readJsonMock.mockResolvedValue({ rejectedBy: '22222222-2222-4222-8222-222222222222', reason: 'Policy mismatch' });

        await rejectLeaveRequestController({ request: new Request('http://localhost/api/hr/leave/req-1/reject', { method: 'POST' }), requestId: 'req-1' });

        expect(rejectLeaveRequestMock).toHaveBeenCalledWith(expect.objectContaining({
            requestId: 'req-1',
            rejectedBy: 'session-user',
        }));
    });

    it('uses session user for cancel even when payload includes cancelledBy', async () => {
        readJsonMock.mockResolvedValue({ cancelledBy: '33333333-3333-4333-8333-333333333333', reason: 'No longer needed' });

        await cancelLeaveRequestController({ request: new Request('http://localhost/api/hr/leave/req-1/cancel', { method: 'POST' }), requestId: 'req-1' });

        expect(cancelLeaveRequestMock).toHaveBeenCalledWith(expect.objectContaining({
            requestId: 'req-1',
            cancelledBy: 'session-user',
        }));
    });
});
