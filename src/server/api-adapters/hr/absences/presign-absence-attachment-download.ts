import { ValidationError } from '@/server/errors';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE_TYPE, HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions';
import { withOrgContext } from '@/server/security/guards';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

interface PresignDownloadControllerInput {
    request: Request;
    absenceId: string;
    attachmentId: string;
}

export async function presignAbsenceAttachmentDownloadController(
    { request, absenceId, attachmentId }: PresignDownloadControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<{ url: string; expiresAt: string }> {
    if (!absenceId) {
        throw new ValidationError('Absence id is required.');
    }
    if (!attachmentId) {
        throw new ValidationError('Attachment id is required.');
    }

    const { session, service } = resolveAbsenceControllerDependencies(dependencies);
    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.ABSENCE_READ,
        auditSource: 'api:hr:absences:attachments:download',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
        resourceAttributes: { absenceId, attachmentId },
    });

    return withOrgContext(
        {
            orgId: authorization.orgId,
            userId: authorization.userId,
            auditSource: authorization.auditSource,
            expectedClassification: authorization.dataClassification,
            expectedResidency: authorization.dataResidency,
            action: 'hr.absence.attachment.download',
            resourceType: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
            resourceAttributes: { absenceId, attachmentId },
        },
        () => service.presignAbsenceAttachmentDownload({
            authorization,
            absenceId,
            attachmentId,
        }),
    );
}
