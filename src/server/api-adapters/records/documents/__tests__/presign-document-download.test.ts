import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
    getSessionContext: vi.fn(),
}));

const documentServiceMocks = vi.hoisted(() => ({
    getDocumentService: vi.fn(),
}));

const storageConfigMocks = vi.hoisted(() => ({
    getDocumentVaultStorageConfig: vi.fn(),
}));

const presignerMocks = vi.hoisted(() => ({
    presignAzureBlobRead: vi.fn(),
}));

const permissionMocks = vi.hoisted(() => ({
    hasPermission: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
    recordAuditEvent: vi.fn(),
}));

vi.mock('@/server/use-cases/auth/sessions/get-session', () => authMocks);
vi.mock('@/server/services/records/document-vault-service', () => documentServiceMocks);
vi.mock('@/server/config/storage', () => storageConfigMocks);
vi.mock('@/server/lib/storage/azure-blob-presigner', () => presignerMocks);
vi.mock('@/lib/security/permission-check', () => permissionMocks);
vi.mock('@/server/logging/audit-logger', () => auditMocks);

import { InfrastructureError } from '@/server/errors';
import { presignDocumentDownloadController } from '../presign-document-download';

describe('presignDocumentDownloadController', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        authMocks.getSessionContext.mockResolvedValue({
            authorization: {
                orgId: 'org-1',
                userId: 'user-1',
                dataResidency: 'UK_ONLY',
                dataClassification: 'OFFICIAL',
                permissions: {},
                auditSource: 'test',
            },
        });
        permissionMocks.hasPermission.mockReturnValue(false);
        auditMocks.recordAuditEvent.mockResolvedValue(undefined);
        storageConfigMocks.getDocumentVaultStorageConfig.mockReturnValue({});
        documentServiceMocks.getDocumentService.mockResolvedValue({
            id: 'doc-1',
            ownerUserId: 'user-1',
            blobPointer: 'https://storage.example/doc-1',
            mimeType: 'application/pdf',
            fileName: 'doc.pdf',
            type: 'COMPLIANCE',
            classification: 'OFFICIAL',
        });
    });

    it('fails closed when secure presign generation fails', async () => {
        presignerMocks.presignAzureBlobRead.mockImplementation(() => {
            throw new Error('presign failed');
        });

        await expect(
            presignDocumentDownloadController(new Request('http://localhost/api/hr/documents/doc-1/download'), 'doc-1'),
        ).rejects.toBeInstanceOf(InfrastructureError);
    });
});
