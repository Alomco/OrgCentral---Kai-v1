import type { RemoveAbsenceAttachmentResult } from '@/server/use-cases/hr/absences/remove-absence-attachment';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { removeAbsenceAttachmentSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

interface RemoveAttachmentControllerInput {
    request: Request;
    absenceId: string;
}

export async function removeAbsenceAttachmentController(
    { request, absenceId }: RemoveAttachmentControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<RemoveAbsenceAttachmentResult> {
    const raw: unknown = await readJson(request);
    const payload = removeAbsenceAttachmentSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: 'api:hr:absences:attachments:remove',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            attachmentId: payload.attachmentId,
        },
    });

    return service.removeAttachment({ authorization, absenceId, payload });
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
