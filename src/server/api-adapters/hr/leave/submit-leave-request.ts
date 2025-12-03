import { randomUUID } from 'node:crypto';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { requireSessionUser } from '@/server/api-adapters/http/session-helpers';
import { resolveHoursPerDay } from '@/server/domain/leave/hours-per-day-resolver';
import { getFeatureFlagDecision } from '@/server/lib/optimizely';
import type { SubmitLeaveRequestResult as SubmitLeaveRequestUseCaseResult } from '@/server/use-cases/hr/leave/submit-leave-request';
import type { LeaveRequest } from '@/server/types/leave-types';
import {
    submitLeaveRequestSchema,
    type SubmitLeaveRequestPayload,
} from '@/server/types/hr-leave-schemas';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
    readJson,
} from './common';

export interface SubmitLeaveRequestResult extends SubmitLeaveRequestUseCaseResult {
    success: true;
    hoursPerDayUsed: number;
    policyResolverEnabled: boolean;
    featureDecisionSource: 'optimizely' | 'fallback';
}

export async function submitLeaveRequestController(
    request: Request,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<SubmitLeaveRequestResult> {
    const raw = await readJson<SubmitLeaveRequestPayload>(request);
    const payload = submitLeaveRequestSchema.parse(raw);

    const { session, service, absenceSettingsRepository } = resolveLeaveControllerDependencies(dependencies);

    const { session: authSession, authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['member'],
        requiredPermissions: { organization: ['create'] },
        auditSource: 'api:hr:leave:submit',
        action: 'create',
        resourceType: 'hr.leave',
        resourceAttributes: {
            leaveType: payload.leaveType,
            employeeId: payload.employeeId,
            requestedDays: payload.totalDays,
        },
    });

    const { userId } = requireSessionUser(authSession);
    const requestId = payload.id ?? randomUUID();
    const actorUserId = payload.userId ?? payload.employeeId;
    const submittedAt = new Date();
    const hoursPerDay = await resolveHoursPerDay(absenceSettingsRepository, authorization.orgId);
    const leaveRequest: Omit<LeaveRequest, 'createdAt'> = {
        id: requestId,
        orgId: authorization.orgId,
        employeeId: payload.employeeId,
        userId: actorUserId,
        employeeName: payload.employeeName,
        leaveType: payload.leaveType,
        startDate: payload.startDate.toISOString(),
        endDate: (payload.endDate ?? payload.startDate).toISOString(),
        reason: payload.reason,
        totalDays: payload.totalDays,
        isHalfDay: payload.isHalfDay ?? false,
        coveringEmployeeId: payload.coveringEmployeeId,
        coveringEmployeeName: payload.coveringEmployeeName,
        status: 'submitted',
        createdBy: userId,
        submittedAt: submittedAt.toISOString(),
        approvedBy: undefined,
        approvedAt: undefined,
        rejectedBy: undefined,
        rejectedAt: undefined,
        rejectionReason: undefined,
        cancelledBy: undefined,
        cancelledAt: undefined,
        cancellationReason: undefined,
        managerComments: payload.managerComments,
    };

    const decision = await getFeatureFlagDecision('leave_policy_resolver', userId);

    const result = await service.submitLeaveRequest({
        authorization,
        request: { ...leaveRequest, hoursPerDay },
    });

    return {
        ...result,
        success: true,
        hoursPerDayUsed: hoursPerDay,
        policyResolverEnabled: decision.enabled,
        featureDecisionSource: decision.source,
    };
}
