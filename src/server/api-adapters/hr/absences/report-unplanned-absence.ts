import type { ReportUnplannedAbsenceResult } from '@/server/use-cases/hr/absences/report-unplanned-absence';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    reportUnplannedAbsenceSchema,
    type ReportUnplannedAbsencePayload,
} from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export async function reportUnplannedAbsenceController(
    request: Request,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<ReportUnplannedAbsenceResult> {
    const raw: unknown = await request.json();
    const payload = reportUnplannedAbsenceSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: 'api:hr:absences:report',
        action: HR_ACTION.CREATE,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: buildResourceAttributes(payload),
    });

    return service.reportAbsence({ authorization, payload });
}

function buildResourceAttributes(payload: ReportUnplannedAbsencePayload): Record<string, unknown> {
    return {
        scope: 'unplanned',
        targetUserId: payload.userId,
        typeId: payload.typeId ?? null,
        typeKey: payload.typeKey ?? null,
        hasCustomHours: typeof payload.hours === 'number',
    };
}
