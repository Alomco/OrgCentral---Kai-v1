import type { DocumentVault } from '@prisma/client';
import type { DocumentVaultFilters, DocumentVaultCreationData, DocumentVaultUpdateData } from '@/server/repositories/prisma/records/documents/prisma-document-vault-repository.types';

export interface IDocumentVaultRepository {
    findById(id: string): Promise<DocumentVault | null>;
    findByBlobPointer(blobPointer: string): Promise<DocumentVault | null>;
    findAll(filters?: DocumentVaultFilters): Promise<DocumentVault[]>;
    create(data: DocumentVaultCreationData): Promise<DocumentVault>;
    update(id: string, data: DocumentVaultUpdateData): Promise<DocumentVault>;
    delete(id: string): Promise<DocumentVault>;
    /**
     * Contract-facing method for retrieving a document by ID for a tenant/user with ABAC checks.
     */
    getDocument?(tenantId: string, userId: string, id: string): Promise<DocumentVault | null>;
}
