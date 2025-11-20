import type { Prisma, DocumentType, SecurityClassification, RetentionPolicy } from '@prisma/client';

export interface DocumentVaultFilters {
    orgId?: string;
    ownerUserId?: string;
    type?: DocumentType;
    classification?: string;
    retentionPolicy?: RetentionPolicy;
    fileName?: string;
}

export interface DocumentVaultCreationData {
    orgId: string;
    ownerOrgId?: string;
    ownerUserId?: string;
    type: DocumentType;
    classification: SecurityClassification;
    retentionPolicy: RetentionPolicy;
    retentionExpires?: Date;
    blobPointer: string;
    checksum: string;
    mimeType?: string;
    sizeBytes?: number;
    fileName: string;
    version?: number;
    latestVersionId?: string;
    encrypted?: boolean;
    encryptedKeyRef?: string;
    sensitivityLevel?: number;
    dataCategory?: string;
    lawfulBasis?: string;
    dataSubject?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}

export interface DocumentVaultUpdateData {
    version?: number;
    latestVersionId?: string;
    retentionExpires?: Date;
    encrypted?: boolean;
    encryptedKeyRef?: string;
    sensitivityLevel?: number;
    dataCategory?: string;
    lawfulBasis?: string;
    dataSubject?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}
