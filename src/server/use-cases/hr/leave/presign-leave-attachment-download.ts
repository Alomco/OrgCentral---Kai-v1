import { getLeaveAttachment, type GetLeaveAttachmentDependencies } from './get-leave-attachment';
import { getLeaveStorageConfig } from '@/server/config/storage';
import { presignAzureBlobRead } from '@/server/lib/storage/azure-blob-presigner';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export interface PresignLeaveAttachmentDownloadInput {
    authorization: RepositoryAuthorizationContext;
    attachmentId: string;
}

export interface PresignLeaveAttachmentDownloadResult {
    url: string;
    expiresAt: string;
}

export type PresignLeaveAttachmentDownloadDependencies = GetLeaveAttachmentDependencies;

export async function presignLeaveAttachmentDownload(
    deps: PresignLeaveAttachmentDownloadDependencies,
    input: PresignLeaveAttachmentDownloadInput,
): Promise<PresignLeaveAttachmentDownloadResult> {
    const { attachment } = await getLeaveAttachment(deps, input);
    const config = getLeaveStorageConfig();

    const presigned = presignAzureBlobRead(config, {
        blobUrl: attachment.storageKey,
        contentType: attachment.contentType,
    });

    return { url: presigned.downloadUrl, expiresAt: presigned.expiresAt };
}