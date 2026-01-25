import { ValidationError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { buildAbsenceAttachmentBlobName, presignAzureBlobUpload } from '@/server/lib/storage/azure-blob-presigner';
import { getAbsenceStorageConfig } from '@/server/config/storage';

export interface PresignAbsenceAttachmentDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface PresignAbsenceAttachmentInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
}

export interface PresignAbsenceAttachmentResult {
    uploadUrl: string;
    storageKey: string;
    headers: Record<string, string>;
    expiresAt: string;
}

export async function presignAbsenceAttachment(
    deps: PresignAbsenceAttachmentDependencies,
    input: PresignAbsenceAttachmentInput,
): Promise<PresignAbsenceAttachmentResult> {
    const absence = await deps.absenceRepository.getAbsence(input.authorization, input.absenceId);
    if (!absence) {
        throw new ValidationError('Absence not found.');
    }

    if (absence.deletedAt) {
        throw new ValidationError('Cannot upload evidence for deleted absences.');
    }

    const config = getAbsenceStorageConfig();
    if (input.fileSize > config.maxBytes) {
        const maxFileSizeMb = Math.floor(config.maxBytes / 1024 / 1024).toString();
        throw new ValidationError(`Attachment exceeds maximum size of ${maxFileSizeMb} MB.`);
    }

    const blobName = buildAbsenceAttachmentBlobName(
        input.authorization.orgId,
        input.authorization.dataResidency,
        input.absenceId,
        input.fileName,
    );

    const presigned = presignAzureBlobUpload(config, {
        blobName,
        contentType: input.contentType,
        contentLength: input.fileSize,
    });

    return {
        uploadUrl: presigned.uploadUrl,
        storageKey: presigned.storageKey,
        headers: presigned.headers,
        expiresAt: presigned.expiresAt,
    };
}
