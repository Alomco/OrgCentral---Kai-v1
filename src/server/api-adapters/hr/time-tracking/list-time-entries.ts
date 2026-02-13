import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import type { ListTimeEntriesResult } from '@/server/use-cases/hr/time-tracking/list-time-entries';
import { timeEntryFiltersSchema, type TimeEntryFilters } from '@/server/types/hr-time-tracking-schemas';
import {
    defaultTimeTrackingControllerDependencies,
    resolveTimeTrackingControllerDependencies,
    TIME_ENTRY_RESOURCE,
    type TimeTrackingControllerDependencies,
} from './common';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';
import { HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/profiles';

export interface ListTimeEntriesControllerInput {
    headers: Headers | HeadersInit;
    input?: unknown;
    auditSource: string;
}

export async function listTimeEntriesController(
    controllerInput: ListTimeEntriesControllerInput,
    dependencies: TimeTrackingControllerDependencies = defaultTimeTrackingControllerDependencies,
): Promise<ListTimeEntriesResult> {
    const resolved = resolveTimeTrackingControllerDependencies(dependencies);

    const parsed = timeEntryFiltersSchema.parse(controllerInput.input ?? {});
    const filters = normalizeFilters(parsed);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.TIME_ENTRY_LIST,
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.LIST,
        resourceType: TIME_ENTRY_RESOURCE,
        resourceAttributes: buildFilterAttributes(filters),
    });

    return resolved.service.listTimeEntries({ authorization, filters });
}

function normalizeFilters(filters: TimeEntryFilters): TimeEntryFilters | undefined {
    const hasValues =
        Boolean(filters.userId) || Boolean(filters.status) || Boolean(filters.from) || Boolean(filters.to);
    return hasValues ? filters : undefined;
}

function buildFilterAttributes(filters?: TimeEntryFilters): Record<string, unknown> | undefined {
    if (!filters) {
        return undefined;
    }

    return {
        userId: filters.userId ?? null,
        status: filters.status ?? null,
        from: filters.from?.toISOString() ?? null,
        to: filters.to?.toISOString() ?? null,
    };
}
