import { describe, expect, it, vi } from 'vitest';

import { cancelLeaveRequest } from '@/server/use-cases/hr/leave/cancel-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { ValidationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveRequest, LeaveBalance } from '@/server/types/leave-types';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';

function buildAuthorization(): RepositoryAuthorizationContext {
    return {
        orgId: 'org-1',
        userId: 'manager-1',
        roleKey: 'orgAdmin',
        permissions: {},
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        tenantScope: {
            orgId: 'org-1',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test',
            auditBatchId: undefined,
        },
        correlationId: 'corr-1',
    };
}

function buildLeaveRequest(status: LeaveRequest['status']): LeaveRequest {
    return {
        id: 'req-1',
        orgId: 'org-1',
        employeeId: 'EMP-1',
        userId: 'user-1',
        employeeName: 'Test User',
        leaveType: 'annual',
        startDate: '2026-03-10',
        endDate: '2026-03-12',
        totalDays: 2,
        isHalfDay: false,
        status,
        createdAt: '2026-02-01T00:00:00.000Z',
        createdBy: 'user-1',
        submittedAt: '2026-02-01T00:00:00.000Z',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        auditBatchId: undefined,
    };
}

function buildBalance(): LeaveBalance {
    return {
        id: 'bal-1',
        orgId: 'org-1',
        employeeId: 'user-1',
        leaveType: 'annual',
        year: 2026,
        totalEntitlement: 20,
        used: 5,
        pending: 3,
        available: 12,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        dataResidency: 'UK_ONLY',
        dataClassification: 'OFFICIAL',
        auditSource: 'test',
        auditBatchId: undefined,
    };
}

describe('cancel leave transition and error envelope', () => {
    it('reduces used balance when cancelling an approved request', async () => {
        const updateLeaveBalance = vi.fn().mockResolvedValue(undefined);
        const leaveRequestRepository: ILeaveRequestRepository = {
            createLeaveRequest: vi.fn().mockResolvedValue(undefined),
            getLeaveRequest: vi.fn().mockResolvedValue(buildLeaveRequest('approved')),
            updateLeaveRequest: vi.fn().mockResolvedValue(undefined),
            getLeaveRequestsByEmployee: vi.fn().mockResolvedValue([]),
            getLeaveRequestsByOrganization: vi.fn().mockResolvedValue([]),
            countLeaveRequestsByPolicy: vi.fn().mockResolvedValue(0),
        };

        const leaveBalanceRepository: ILeaveBalanceRepository = {
            createLeaveBalance: vi.fn().mockResolvedValue(undefined),
            getLeaveBalance: vi.fn().mockResolvedValue(null),
            getLeaveBalancesByEmployeeAndYear: vi.fn().mockResolvedValue([buildBalance()]),
            updateLeaveBalance,
            getLeaveBalancesByEmployee: vi.fn().mockResolvedValue([]),
            countLeaveBalancesByPolicy: vi.fn().mockResolvedValue(0),
        };

        await cancelLeaveRequest(
            {
                leaveRequestRepository,
                leaveBalanceRepository,
            },
            {
                authorization: buildAuthorization(),
                requestId: 'req-1',
                cancelledBy: 'manager-1',
                reason: 'Cancelled by manager',
            },
        );

        expect(updateLeaveBalance).toHaveBeenCalledWith(
            expect.anything(),
            'bal-1',
            expect.objectContaining({
                used: 3,
                available: 14,
            }),
        );
    });

    it('returns deterministic validation error envelope for invalid leave transition', async () => {
        const response = buildErrorResponse(
            new ValidationError("Cannot approve leave request with status 'cancelled'.", {
                requestId: 'req-1',
                currentStatus: 'cancelled',
                expectedStatus: 'submitted',
            }),
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: {
                code: 'VALIDATION_ERROR',
                message: "Cannot approve leave request with status 'cancelled'.",
                details: {
                    requestId: 'req-1',
                    currentStatus: 'cancelled',
                    expectedStatus: 'submitted',
                },
            },
        });
    });
});
