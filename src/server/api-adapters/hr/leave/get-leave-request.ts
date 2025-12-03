import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { resolveHoursPerDay } from '@/server/domain/leave/hours-per-day-resolver';
import type { GetLeaveRequestResult } from '@/server/use-cases/hr/leave/get-leave-request';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
} from './common';

interface ControllerInput {
    request: Request;
    requestId: string;
}

export interface LeaveRequestControllerResult extends GetLeaveRequestResult {
    success: true;
    hoursPerDayUsed: number;
}

export async function getLeaveRequestController(
    { request, requestId }: ControllerInput,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<LeaveRequestControllerResult> {
    const { session, service, absenceSettingsRepository } = resolveLeaveControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['member'],
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:get',
        action: 'read',
        resourceType: 'hr.leave',
        resourceAttributes: { requestId },
    });

    const hoursPerDay = await resolveHoursPerDay(absenceSettingsRepository, authorization.orgId);
    const result = await service.getLeaveRequest({
        authorization,
        requestId,
        options: { hoursPerDay },
    });

    return {
        ...result,
        success: true,
        hoursPerDayUsed: hoursPerDay,
    };
}
