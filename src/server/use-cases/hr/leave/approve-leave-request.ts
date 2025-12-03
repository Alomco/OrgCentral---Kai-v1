import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertNonEmpty } from '@/server/use-cases/shared';
import {
    fetchLeaveRequest,
    assertLeaveRequestStatus,
    getCurrentTimestamp,
    invalidateLeaveCacheScopes,
    buildLeaveDecisionContext,
    reconcileBalanceForApproval,
} from './shared';
import type { LeaveDecisionContext } from './shared';

export interface ApproveLeaveRequestDependencies {
    leaveRequestRepository: ILeaveRequestRepository;
    leaveBalanceRepository: ILeaveBalanceRepository;
    leavePolicyRepository: ILeavePolicyRepository;
    organizationRepository: IOrganizationRepository;
}

export interface ApproveLeaveRequestInput {
    authorization: RepositoryAuthorizationContext;
    requestId: string;
    approverId: string;
    comments?: string;
}

export interface ApproveLeaveRequestResult {
    success: true;
    requestId: string;
    approvedAt: string;
    decisionContext: LeaveDecisionContext;
}

export async function approveLeaveRequest(
    deps: ApproveLeaveRequestDependencies,
    input: ApproveLeaveRequestInput,
): Promise<ApproveLeaveRequestResult> {
    assertNonEmpty(input.requestId, 'Request ID');
    assertNonEmpty(input.approverId, 'Approver ID');

    const existingRequest = await fetchLeaveRequest(
        deps.leaveRequestRepository,
        input.authorization.orgId,
        input.requestId,
    );

    assertLeaveRequestStatus(existingRequest, 'submitted', 'approve');

    const approvedAt = getCurrentTimestamp();
    const decisionContext = buildLeaveDecisionContext(existingRequest);

    await deps.leaveRequestRepository.updateLeaveRequest(
        input.authorization.orgId,
        input.requestId,
        {
            status: 'approved',
            approvedBy: input.approverId,
            approvedAt,
            managerComments: input.comments,
        },
    );

    await reconcileBalanceForApproval(
        {
            leaveBalanceRepository: deps.leaveBalanceRepository,
            leavePolicyRepository: deps.leavePolicyRepository,
            organizationRepository: deps.organizationRepository,
        },
        {
            authorization: input.authorization,
            request: {
                employeeId: existingRequest.employeeId,
                leaveType: existingRequest.leaveType,
                startDate: existingRequest.startDate,
                totalDays: existingRequest.totalDays,
            },
        },
    );

    await invalidateLeaveCacheScopes(
        input.authorization,
        'requests',
        'balances',
    );

    return {
        success: true,
        requestId: input.requestId,
        approvedAt,
        decisionContext,
    };
}
