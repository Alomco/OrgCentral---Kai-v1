import type { DeleteUnplannedAbsenceResult } from '@/server/use-cases/hr/absences/delete-unplanned-absence';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { deleteAbsenceSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

interface DeleteAbsenceControllerInput {
    request: Request;
    absenceId: string;
}

export async function deleteUnplannedAbsenceController(
    { request, absenceId }: DeleteAbsenceControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<DeleteUnplannedAbsenceResult> {
    const raw: unknown = await readJson(request);
    const payload = deleteAbsenceSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['delete'] },
        auditSource: 'api:hr:absences:delete',
        action: HR_ACTION.DELETE,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            includesMetadata: Boolean(payload.metadata),
        },
    });

    return service.deleteAbsence({ authorization, absenceId, payload });
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
