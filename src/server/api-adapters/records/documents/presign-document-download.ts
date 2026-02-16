import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getDocumentService } from '@/server/services/records/document-vault-service';
import { hasPermission } from '@/lib/security/permission-check';
import { getDocumentVaultStorageConfig } from '@/server/config/storage';
import { presignAzureBlobRead } from '@/server/lib/storage/azure-blob-presigner';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { AuthorizationError, EntityNotFoundError, InfrastructureError } from '@/server/errors';

export interface PresignDocumentDownloadResponse {
    downloadUrl: string;
    expiresAt: string;
    fileName: string;
}

export async function presignDocumentDownloadController(
    request: Request,
    documentId: string,
): Promise<PresignDocumentDownloadResponse> {
    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            requiredPermissions: { employeeProfile: ['read'] },
            auditSource: 'api:records:documents:download',
            action: 'read',
            resourceType: 'records.document',
            resourceAttributes: { documentId },
        },
    );

    const document = await getDocumentService(authorization, documentId);
    if (!document) {
        throw new EntityNotFoundError('Document', { documentId });
    }

    const canReadAll = hasPermission(authorization.permissions, 'organization', 'read');
    if (document.ownerUserId && document.ownerUserId !== authorization.userId && !canReadAll) {
        throw new AuthorizationError('Not authorized to access this document.', {
            reason: 'forbidden',
            documentId,
        });
    }

    if (!document.blobPointer.startsWith('http')) {
        throw new InfrastructureError('Document storage pointer is invalid.', {
            documentId,
        });
    }

    let downloadUrl: string;
    let expiresAt: string;

    try {
        const config = getDocumentVaultStorageConfig();
        const presigned = presignAzureBlobRead(config, {
            blobUrl: document.blobPointer,
            contentType: document.mimeType ?? undefined,
        });
        downloadUrl = presigned.downloadUrl;
        expiresAt = presigned.expiresAt;
    } catch {
        throw new InfrastructureError('Unable to generate secure download URL.', {
            documentId,
        });
    }

    await recordAuditEvent({
        orgId: authorization.orgId,
        userId: authorization.userId,
        eventType: 'ACCESS',
        action: 'records.document.download',
        resource: 'records.document',
        resourceId: document.id,
        residencyZone: authorization.dataResidency,
        classification: authorization.dataClassification,
        auditSource: authorization.auditSource,
        payload: {
            documentId: document.id,
            fileName: document.fileName,
            type: document.type,
            classification: document.classification,
        },
    });

    return { downloadUrl, expiresAt, fileName: document.fileName };
}
