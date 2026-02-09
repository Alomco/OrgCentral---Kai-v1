import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveRequest } from '@/server/types/leave-types';
import { assertNonEmpty } from '@/server/use-cases/shared';
import { invalidateLeaveCacheScopes } from './shared';
import { resolveLeavePolicyId } from './utils/resolve-leave-policy';
import { reconcileBalanceForPendingIncrease } from './shared/leave-balance-adjustments';

export interface SubmitLeaveRequestDependencies {
    leaveRequestRepository: ILeaveRequestRepository;
    leavePolicyRepository: ILeavePolicyRepository;
    leaveBalanceRepository: ILeaveBalanceRepository;
    organizationRepository: IOrganizationRepository;
}

export interface SubmitLeaveRequestInput {
    authorization: RepositoryAuthorizationContext;
    request: Omit<
        LeaveRequest,
        'createdAt' | 'orgId' | 'dataResidency' | 'dataClassification' | 'auditSource' | 'auditBatchId'
    > & { hoursPerDay?: number };
}

export interface SubmitLeaveRequestResult {
    success: true;
    requestId: string;
    policyId: string;
}

export async function submitLeaveRequestWithPolicy(
    deps: SubmitLeaveRequestDependencies,
    { authorization, request }: SubmitLeaveRequestInput,
): Promise<SubmitLeaveRequestResult> {
    assertNonEmpty(request.id, 'Leave request ID');
    assertNonEmpty(request.employeeId, 'Employee ID');
    assertNonEmpty(request.leaveType, 'Leave type');

    const policyId = await resolveLeavePolicyId(
        { leavePolicyRepository: deps.leavePolicyRepository },
        authorization.tenantScope,
        request.leaveType,
    );

    await deps.leaveRequestRepository.createLeaveRequest(authorization.tenantScope, {
        ...request,
        orgId: authorization.orgId,
        dataResidency: authorization.dataResidency,
        dataClassification: authorization.dataClassification,
        auditSource: authorization.auditSource,
        auditBatchId: authorization.auditBatchId,
        policyId,
    });

    await reconcileBalanceForPendingIncrease(
        {
            leaveBalanceRepository: deps.leaveBalanceRepository,
            leavePolicyRepository: deps.leavePolicyRepository,
            organizationRepository: deps.organizationRepository,
        },
        {
            authorization,
            request: {
                userId: request.userId,
                leaveType: request.leaveType,
                startDate: request.startDate,
                totalDays: request.totalDays,
            },
        },
    );

    await invalidateLeaveCacheScopes(authorization, 'requests', 'balances');

    return {
        success: true,
        requestId: request.id,
        policyId,
    };
}
