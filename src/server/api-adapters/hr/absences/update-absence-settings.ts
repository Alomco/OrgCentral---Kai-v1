import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateAbsenceSettingsSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

export async function updateAbsenceSettingsController(
    request: Request,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
) {
    const raw: unknown = await request.json();
    const payload = updateAbsenceSettingsSchema.parse(raw);

    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['orgAdmin'],
        auditSource: 'api:hr:absences:update-settings',
        action: 'update',
        resourceType: 'hr.absence-settings',
        resourceAttributes: { scope: 'unplanned' },
    });

    return service.updateSettings({ authorization, payload });
}
