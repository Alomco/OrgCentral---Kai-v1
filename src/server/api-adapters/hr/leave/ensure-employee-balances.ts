import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { getFeatureFlagDecision } from '@/server/lib/optimizely';
import type { EnsureEmployeeBalancesResult as EnsureBalancesUseCaseResult } from '@/server/use-cases/hr/leave/ensure-employee-balances';
import {
    ensureLeaveBalancesSchema,
    type EnsureLeaveBalancesPayload,
} from '@/server/types/hr-leave-schemas';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
    readJson,
} from './common';

export interface EnsureEmployeeBalancesControllerResult extends EnsureBalancesUseCaseResult {
    success: true;
    policyResolverEnabled: boolean;
    featureDecisionSource: 'optimizely' | 'fallback';
}

export async function ensureEmployeeBalancesController(
    request: Request,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<EnsureEmployeeBalancesControllerResult> {
    const payload = ensureLeaveBalancesSchema.parse(await readJson<EnsureLeaveBalancesPayload>(request));
    const { session, service } = resolveLeaveControllerDependencies(dependencies);

    const { session: authSession, authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:leave:balance:ensure',
        action: 'update',
        resourceType: 'hr.leave.balance',
        resourceAttributes: {
            employeeId: payload.employeeId,
            year: payload.year,
            leaveTypes: payload.leaveTypes,
        },
    });

    const { userId } = requireSessionUser(authSession);
    const decision = await getFeatureFlagDecision('leave_policy_resolver', userId);

    const result = await service.ensureEmployeeBalances({
        authorization,
        employeeId: payload.employeeId,
        year: payload.year,
        leaveTypes: payload.leaveTypes,
    });

    return {
        ...result,
        success: true,
        policyResolverEnabled: decision.enabled,
        featureDecisionSource: decision.source,
    };
}
