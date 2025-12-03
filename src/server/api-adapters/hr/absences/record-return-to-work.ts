import type { RecordReturnToWorkResult } from '@/server/use-cases/hr/absences/record-return-to-work';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { returnToWorkSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

interface RecordReturnToWorkControllerInput {
    request: Request;
    absenceId: string;
}

export async function recordReturnToWorkController(
    { request, absenceId }: RecordReturnToWorkControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<RecordReturnToWorkResult> {
    const raw: unknown = await readJson(request);
    const payload = returnToWorkSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['member'],
        auditSource: 'api:hr:absences:return-to-work',
        action: 'update',
        resourceType: 'hr.absence',
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            hasComments: Boolean(payload.comments),
            returnDate: payload.returnDate.toISOString(),
        },
    });

    return service.recordReturnToWork({ authorization, absenceId, payload });
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
