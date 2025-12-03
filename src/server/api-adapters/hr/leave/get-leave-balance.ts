import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { GetLeaveBalanceResult } from '@/server/use-cases/hr/leave/get-leave-balance';
import {
    leaveBalanceQuerySchema,
    type LeaveBalanceQueryPayload,
} from '@/server/types/hr-leave-schemas';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
} from './common';

export interface GetLeaveBalanceControllerResult extends GetLeaveBalanceResult {
    success: true;
}

export async function getLeaveBalanceController(
    request: Request,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<GetLeaveBalanceControllerResult> {
    const query = parseQuery(request);
    const { session, service } = resolveLeaveControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['member'],
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:balance:get',
        action: 'read',
        resourceType: 'hr.leave.balance',
        resourceAttributes: { employeeId: query.employeeId, year: query.year ?? null },
    });

    const result = await service.getLeaveBalance({
        authorization,
        employeeId: query.employeeId,
        year: query.year,
    });

    return {
        ...result,
        success: true,
    };
}

function parseQuery(request: Request): LeaveBalanceQueryPayload {
    const url = new URL(request.url);
    const raw = {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        year: url.searchParams.get('year') ?? undefined,
    };
    return leaveBalanceQuerySchema.parse(raw);
}
