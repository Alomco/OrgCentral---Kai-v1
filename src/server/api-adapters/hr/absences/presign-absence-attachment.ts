import { z } from 'zod';

import { ValidationError } from '@/server/errors';
import { getAbsenceStorageConfig } from '@/server/config/storage';
import {
    assertAllowedAttachmentContentType,
    assertAttachmentSizeWithinLimit,
} from '@/server/lib/uploads/attachment-validation';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE_TYPE, HR_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions';
import { withOrgContext } from '@/server/security/guards';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

const presignSchema = z.object({
    fileName: z.string().min(1).max(180),
    contentType: z.string().min(1),
    fileSize: z.number().int().positive(),
});

export interface PresignAbsenceAttachmentResponse {
    uploadUrl: string;
    storageKey: string;
    headers: Record<string, string>;
    expiresAt: string;
}

interface PresignControllerInput {
    request: Request;
    absenceId: string;
}

export async function presignAbsenceAttachmentController(
    { request, absenceId }: PresignControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
): Promise<PresignAbsenceAttachmentResponse> {
    if (!absenceId) {
        throw new ValidationError('Absence id is required.');
    }

    const raw: unknown = await readJson(request);
    const payload = presignSchema.parse(raw);
    const config = getAbsenceStorageConfig();

    assertAllowedAttachmentContentType(payload.contentType);
    assertAttachmentSizeWithinLimit(payload.fileSize, config.maxBytes);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.ABSENCE_UPDATE,
        auditSource: 'api:hr:absences:attachments:presign',
        action: HR_ACTION.CREATE,
        resourceType: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
        resourceAttributes: {
            absenceId,
            fileName: payload.fileName,
            fileSize: payload.fileSize,
        },
    });

    return withOrgContext(
        {
            orgId: authorization.orgId,
            userId: authorization.userId,
            auditSource: authorization.auditSource,
            expectedClassification: authorization.dataClassification,
            expectedResidency: authorization.dataResidency,
            action: 'hr.absence.attachment.presign',
            resourceType: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
            resourceAttributes: {
                absenceId,
                fileName: payload.fileName,
                fileSize: payload.fileSize,
            },
        },
        () => service.presignAbsenceAttachment({
            authorization,
            absenceId,
            fileName: payload.fileName,
            contentType: payload.contentType,
            fileSize: payload.fileSize,
        }),
    );
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
