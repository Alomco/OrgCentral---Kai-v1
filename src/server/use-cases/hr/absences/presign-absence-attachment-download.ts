import { getAbsenceAttachment, type GetAbsenceAttachmentDependencies } from './get-absence-attachment';
import { getAbsenceStorageConfig } from '@/server/config/storage';
import { presignAzureBlobRead } from '@/server/lib/storage/azure-blob-presigner';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export interface PresignAbsenceAttachmentDownloadInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    attachmentId: string;
}

export interface PresignAbsenceAttachmentDownloadResult {
    url: string;
    expiresAt: string;
}

export type PresignAbsenceAttachmentDownloadDependencies = GetAbsenceAttachmentDependencies;

export async function presignAbsenceAttachmentDownload(
    deps: PresignAbsenceAttachmentDownloadDependencies,
    input: PresignAbsenceAttachmentDownloadInput,
): Promise<PresignAbsenceAttachmentDownloadResult> {
    const { attachment } = await getAbsenceAttachment(deps, input);
    const config = getAbsenceStorageConfig();

    const presigned = presignAzureBlobRead(config, {
        blobUrl: attachment.storageKey,
        contentType: attachment.contentType,
    });

    return { url: presigned.downloadUrl, expiresAt: presigned.expiresAt };
}
