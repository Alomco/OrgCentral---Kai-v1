import type { ApproveUnplannedAbsenceResult } from '@/server/use-cases/hr/absences/approve-unplanned-absence';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { approveAbsenceSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
} from './common';

interface ApproveControllerInput {
    request: Request;
    absenceId: string;
}

export async function approveUnplannedAbsenceController(
    { request, absenceId }: ApproveControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<ApproveUnplannedAbsenceResult> {
    const raw: unknown = await readJson(request);
    const payload = approveAbsenceSchema.parse(raw);

    const { session, service } = resolveAbsenceControllerDependencies(dependencies);
    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:absences:approve',
        action: 'update',
        resourceType: 'hr.absence',
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            decision: payload.status ?? 'APPROVED',
        },
    });

    return service.approveAbsence({ authorization, absenceId, payload });
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
