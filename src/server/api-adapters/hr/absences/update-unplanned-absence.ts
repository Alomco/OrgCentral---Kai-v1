import type { UpdateUnplannedAbsenceResult } from '@/server/use-cases/hr/absences/update-unplanned-absence';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateAbsenceSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

interface UpdateAbsenceControllerInput {
    request: Request;
    absenceId: string;
}

export async function updateUnplannedAbsenceController(
    { request, absenceId }: UpdateAbsenceControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<UpdateUnplannedAbsenceResult> {
    const raw: unknown = await readJson(request);
    const payload = updateAbsenceSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['member'],
        auditSource: 'api:hr:absences:update',
        action: 'update',
        resourceType: 'hr.absence',
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            includesDates: Boolean(payload.startDate ?? payload.endDate),
            overridesHours: typeof payload.hours === 'number',
        },
    });

    return service.updateAbsence({ authorization, absenceId, payload });
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
