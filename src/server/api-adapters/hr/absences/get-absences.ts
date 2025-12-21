import type { GetAbsencesResult } from '@/server/use-cases/hr/absences/get-absences';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    absenceFiltersSchema,
    type AbsenceQueryFilters,
} from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export async function getAbsencesController(
    request: Request,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<GetAbsencesResult> {
    const filters = parseFilters(request);

    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:absences:get',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: buildFilterAttributes(filters),
    });

    return service.listAbsences({ authorization, filters });
}

function parseFilters(request: Request): AbsenceQueryFilters {
    const url = new URL(request.url);
    const raw = {
        userId: url.searchParams.get('userId') ?? undefined,
        status: url.searchParams.get('status') ?? undefined,
        includeClosed: url.searchParams.get('includeClosed') ?? undefined,
        from: url.searchParams.get('from') ?? undefined,
        to: url.searchParams.get('to') ?? undefined,
    };
    return absenceFiltersSchema.parse(raw);
}

function buildFilterAttributes(filters: AbsenceQueryFilters): Record<string, unknown> {
    return {
        scope: 'unplanned',
        userId: filters.userId ?? null,
        status: filters.status ?? null,
        includeClosed: filters.includeClosed ?? false,
        from: filters.from?.toISOString() ?? null,
        to: filters.to?.toISOString() ?? null,
    };
}
