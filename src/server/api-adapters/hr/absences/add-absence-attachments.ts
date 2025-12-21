import type { AddAbsenceAttachmentsResult } from '@/server/use-cases/hr/absences/add-absence-attachments';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { addAbsenceAttachmentSchema } from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

interface AddAttachmentsControllerInput {
    request: Request;
    absenceId: string;
}

export async function addAbsenceAttachmentsController(
    { request, absenceId }: AddAttachmentsControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<AddAbsenceAttachmentsResult> {
    const raw: unknown = await readJson(request);
    const payload = addAbsenceAttachmentSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: 'api:hr:absences:attachments:add',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            attachmentCount: payload.attachments.length,
        },
    });

    return service.addAttachments({ authorization, absenceId, payload });
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
