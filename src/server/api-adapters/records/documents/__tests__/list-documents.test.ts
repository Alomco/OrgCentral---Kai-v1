import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMocks = vi.hoisted(() => ({
    getSessionContext: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
    listDocumentsService: vi.fn(),
}));

vi.mock('@/server/use-cases/auth/sessions/get-session', () => authMocks);
vi.mock('@/server/services/records/document-vault-service', () => serviceMocks);

import { listDocumentsController } from '../list-documents';

describe('listDocumentsController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authMocks.getSessionContext.mockResolvedValue({ authorization: { orgId: 'org-1' } });
    });

    it('redacts sensitive storage and metadata fields from list responses', async () => {
        serviceMocks.listDocumentsService.mockResolvedValue([
            {
                id: 'doc-1',
                orgId: 'org-1',
                ownerOrgId: 'org-1',
                ownerUserId: 'user-1',
                type: 'COMPLIANCE',
                classification: 'OFFICIAL',
                retentionPolicy: 'ONE_YEAR',
                retentionExpires: null,
                blobPointer: 'https://storage.example/private',
                checksum: 'abc123',
                mimeType: 'application/pdf',
                sizeBytes: 120,
                fileName: 'doc.pdf',
                version: 1,
                latestVersionId: null,
                encrypted: true,
                encryptedKeyRef: 'key-ref',
                sensitivityLevel: 2,
                dataCategory: 'hr',
                lawfulBasis: 'contract',
                dataSubject: { name: 'secret' },
                metadata: { pii: true },
                createdAt: new Date('2026-02-01T00:00:00.000Z'),
            },
        ]);

        const result = await listDocumentsController(new Request('http://localhost/api/hr/documents'));

        expect(result.success).toBe(true);
        expect(result.documents).toHaveLength(1);
        expect(result.documents[0]).not.toHaveProperty('blobPointer');
        expect(result.documents[0]).not.toHaveProperty('checksum');
        expect(result.documents[0]).not.toHaveProperty('metadata');
        expect(result.documents[0]).not.toHaveProperty('dataSubject');
    });
});
