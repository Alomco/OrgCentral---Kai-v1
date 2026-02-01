import { z } from 'zod';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { buildLeaveAttachmentBlobName, presignAzureBlobUpload } from '@/server/lib/storage/azure-blob-presigner';
import { getLeaveStorageConfig } from '@/server/config/storage';
import {
    assertAllowedAttachmentContentType,
    assertAttachmentSizeWithinLimit,
} from '@/server/lib/uploads/attachment-validation';

const presignSchema = z.object({
    requestId: z.uuid(),
    fileName: z.string().min(1).max(180),
    contentType: z.string().min(1),
    fileSize: z.number().int().positive(),
    checksum: z.string().optional(),
});

export interface PresignLeaveAttachmentResponse {
    uploadUrl: string;
    storageKey: string;
    headers: Record<string, string>;
    expiresAt: string;
}

interface PresignControllerInput {
    request: Request;
}

export async function presignLeaveAttachmentController({ request }: PresignControllerInput): Promise<PresignLeaveAttachmentResponse> {
    const raw: unknown = await readJson(request);
    const payload = presignSchema.parse(raw);

    const { authorization } = await getSessionContext({}, {
        headers: request.headers,
        requiredPermissions: { organization: ['read'] },
        auditSource: 'api:hr:leave:attachments:presign',
        action: HR_ACTION.CREATE,
        resourceType: HR_RESOURCE.HR_LEAVE,
        resourceAttributes: { scope: 'self', requestId: payload.requestId },
    });

    const config = getLeaveStorageConfig();
    assertAllowedAttachmentContentType(payload.contentType);
    assertAttachmentSizeWithinLimit(payload.fileSize, config.maxBytes);

    const blobName = buildLeaveAttachmentBlobName(
        authorization.orgId,
        authorization.dataResidency,
        payload.requestId,
        payload.fileName,
    );

    const presigned = presignAzureBlobUpload(config, {
        blobName,
        contentType: payload.contentType,
        contentLength: payload.fileSize,
    });

    return {
        uploadUrl: presigned.uploadUrl,
        storageKey: presigned.storageKey,
        headers: presigned.headers,
        expiresAt: presigned.expiresAt,
    };
}

async function readJson(request: Request): Promise<unknown> {
    try {
        return await request.json();
    } catch {
        return {};
    }
}