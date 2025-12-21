import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { cancelAbsenceSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export async function cancelUnplannedAbsenceController(
    request: Request,
    absenceId: string,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
) {
    const raw: unknown = await request.json();
    const payload = cancelAbsenceSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:absences:cancel',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: { scope: 'unplanned', absenceId },
    });

    return service.cancelAbsence({
        authorization,
        absenceId,
        payload,
    });
}
