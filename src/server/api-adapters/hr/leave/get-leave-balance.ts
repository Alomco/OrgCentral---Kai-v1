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
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:balance:get',
        action: 'read',
        resourceType: 'hr.leave.balance',
        resourceAttributes: { employeeId: query.employeeId ?? null, year: query.year ?? null },
    });

    const employeeId = resolveEmployeeId(query.employeeId, authorization);
    const result = await service.getLeaveBalance({
        authorization,
        employeeId,
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

function resolveEmployeeId(
    employeeId: string | undefined,
    authorization: Awaited<ReturnType<typeof getSessionContext>>['authorization'],
): string {
    if (employeeId && employeeId.trim().length > 0) {
        return employeeId.trim();
    }
    return authorization.userId;
}
