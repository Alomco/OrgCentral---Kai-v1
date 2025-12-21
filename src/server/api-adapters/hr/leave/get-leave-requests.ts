import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { resolveHoursPerDay } from '@/server/domain/leave/hours-per-day-resolver';
import type { GetLeaveRequestsResult } from '@/server/use-cases/hr/leave/get-leave-requests';
import {
    leaveRequestFiltersSchema,
    type LeaveRequestFiltersPayload,
} from '@/server/types/hr-leave-schemas';
import {
    defaultLeaveControllerDependencies,
    resolveLeaveControllerDependencies,
    type LeaveControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export interface LeaveRequestsControllerResult extends GetLeaveRequestsResult {
    success: true;
    hoursPerDayUsed: number;
}

export async function getLeaveRequestsController(
    request: Request,
    dependencies: LeaveControllerDependencies = defaultLeaveControllerDependencies,
): Promise<LeaveRequestsControllerResult> {
    const filters = parseFilters(request);
    const { session, service, absenceSettingsRepository } = resolveLeaveControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:list',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: buildAuditAttributes(filters),
    });

    const hoursPerDay = await resolveHoursPerDay(absenceSettingsRepository, authorization.orgId);
    const result = await service.listLeaveRequests({
        authorization,
        employeeId: filters.employeeId,
        filters: {
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
        },
        options: { hoursPerDay },
    });

    return {
        ...result,
        success: true,
        hoursPerDayUsed: hoursPerDay,
    };
}

function parseFilters(request: Request): LeaveRequestFiltersPayload {
    const url = new URL(request.url);
    const raw = {
        employeeId: url.searchParams.get('employeeId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        startDate: url.searchParams.get('startDate') ?? undefined,
        endDate: url.searchParams.get('endDate') ?? undefined,
    };
    return leaveRequestFiltersSchema.parse(raw);
}

function buildAuditAttributes(filters: LeaveRequestFiltersPayload): Record<string, unknown> {
    return {
        employeeId: filters.employeeId ?? null,
        status: filters.status ?? null,
        startDate: filters.startDate?.toISOString() ?? null,
        endDate: filters.endDate?.toISOString() ?? null,
    };
}
