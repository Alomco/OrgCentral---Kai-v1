import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { ValidationError } from '@/server/errors';

interface PresignDownloadControllerInput {
    request: Request;
    attachmentId: string;
}

export async function presignLeaveAttachmentDownloadController(
    { request, attachmentId }: PresignDownloadControllerInput,
): Promise<{ url: string; expiresAt: string }> {
    if (!attachmentId) {
        throw new ValidationError('Attachment id is required.');
    }

    const { authorization } = await getSessionContext({}, {
        headers: request.headers,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:attachments:download',
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { attachmentId },
    });

    const service = getLeaveService();
    const result = await service.presignLeaveAttachmentDownload({ authorization, attachmentId });
    return { url: result.url, expiresAt: result.expiresAt };
}