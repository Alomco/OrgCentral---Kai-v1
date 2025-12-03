/**
 * Shared utilities specific to leave management use-cases
 */

export {
    fetchLeaveRequest,
    assertLeaveRequestStatus,
    assertLeaveRequestNotInStatus,
    getCurrentTimestamp,
    buildLeaveDecisionContext,
} from './leave-request-helpers';

export type { LeaveDecisionContext } from './leave-request-helpers';

export {
    LEAVE_CACHE_SCOPES,
    registerLeaveCacheScopes,
    invalidateLeaveCacheScopes,
} from './cache-helpers';

export type { LeaveCacheScopeKey } from './cache-helpers';

export {
    resolveLeaveYear,
    buildLeaveBalanceId,
    reconcileBalanceForApproval,
    reconcileBalanceForPendingReduction,
    reconcileBalanceForUsedReduction,
} from './leave-balance-adjustments';

export type {
    LeaveBalanceAdjustmentContext,
    ApprovalBalanceDependencies,
    BalanceDependencies,
} from './leave-balance-adjustments';
