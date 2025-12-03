import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { acknowledgeAbsenceSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

export async function acknowledgeUnplannedAbsenceController(
    request: Request,
    absenceId: string,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
) {
    const raw: unknown = await request.json();
    const payload = acknowledgeAbsenceSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['orgAdmin'],
        auditSource: 'api:hr:absences:acknowledge',
        action: 'update',
        resourceType: 'hr.absence',
        resourceAttributes: { scope: 'unplanned', absenceId },
    });

    return service.acknowledgeAbsence({
        authorization,
        absenceId,
        payload,
    });
}
