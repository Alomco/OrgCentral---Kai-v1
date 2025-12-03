/**
 * Leave Management Use-Cases Module
 * 
 * This module provides business logic for leave request operations.
 * All use-cases follow the same pattern:
 * - Dependencies interface (repository contracts)
 * - Input interface (authorization + parameters)
 * - Result interface (success flag + relevant data)
 * - Async function implementing the use-case
 * 
 * @example
 * ```typescript
 * import { approveLeaveRequest } from '@/server/use-cases/hr/leave';
 * 
 * const result = await approveLeaveRequest(
 *   { leaveRequestRepository },
 *   { authorization, requestId, approverId }
 * );
 * ```
 */

// Status change operations
export {
    approveLeaveRequest,
    type ApproveLeaveRequestDependencies,
    type ApproveLeaveRequestInput,
    type ApproveLeaveRequestResult,
} from './approve-leave-request';

export {
    rejectLeaveRequest,
    type RejectLeaveRequestDependencies,
    type RejectLeaveRequestInput,
    type RejectLeaveRequestResult,
} from './reject-leave-request';

export {
    cancelLeaveRequest,
    type CancelLeaveRequestDependencies,
    type CancelLeaveRequestInput,
    type CancelLeaveRequestResult,
} from './cancel-leave-request';

// Query operations
export {
    getLeaveBalance,
    type GetLeaveBalanceDependencies,
    type GetLeaveBalanceInput,
    type GetLeaveBalanceResult,
} from './get-leave-balance';

export {
    getLeaveRequests,
    type GetLeaveRequestsDependencies,
    type GetLeaveRequestsInput,
    type GetLeaveRequestsResult,
} from './get-leave-requests';

export {
    getLeaveRequest,
    type GetLeaveRequestDependencies,
    type GetLeaveRequestInput,
    type GetLeaveRequestResult,
} from './get-leave-request';

// Administrative operations
export {
    ensureEmployeeBalances,
    type EnsureEmployeeBalancesDependencies,
    type EnsureEmployeeBalancesInput,
    type EnsureEmployeeBalancesResult,
} from './ensure-employee-balances';

export {
    submitLeaveRequestWithPolicy,
    type SubmitLeaveRequestDependencies,
    type SubmitLeaveRequestInput,
    type SubmitLeaveRequestResult,
} from './submit-leave-request';

export {
    createLeaveBalanceWithPolicy,
    type CreateLeaveBalanceDependencies,
    type CreateLeaveBalanceInput,
    type CreateLeaveBalanceResult,
} from './create-leave-balance';
