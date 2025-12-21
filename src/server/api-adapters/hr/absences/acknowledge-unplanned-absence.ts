import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { acknowledgeAbsenceSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

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
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:absences:acknowledge',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: { scope: 'unplanned', absenceId },
    });

    return service.acknowledgeAbsence({
        authorization,
        absenceId,
        payload,
    });
}
