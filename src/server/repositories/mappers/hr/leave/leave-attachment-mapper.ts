import type { LeaveAttachment } from '@/server/types/leave-types';
import type { DataClassificationLevel, DataResidencyZone, PrismaJsonValue } from '@/server/types/prisma';

interface LeaveAttachmentRecord {
    id: string;
    orgId: string;
    requestId: string;
    fileName: string;
    storageKey: string;
    contentType: string;
    fileSize: number;
    checksum?: string | null;
    uploadedByUserId: string;
    uploadedAt: Date;
    metadata?: PrismaJsonValue | null;
    dataClassification: DataClassificationLevel;
    residencyTag: DataResidencyZone;
    auditSource?: string | null;
    auditBatchId?: string | null;
}

export function mapLeaveAttachmentFromPrisma(record: LeaveAttachmentRecord): LeaveAttachment {
    return {
        id: record.id,
        orgId: record.orgId,
        requestId: record.requestId,
        fileName: record.fileName,
        storageKey: record.storageKey,
        contentType: record.contentType,
        fileSize: record.fileSize,
        checksum: record.checksum ?? undefined,
        uploadedByUserId: record.uploadedByUserId,
        uploadedAt: record.uploadedAt.toISOString(),
        metadata: toMetadataRecord(record.metadata),
        dataClassification: record.dataClassification,
        dataResidency: record.residencyTag,
        auditSource: record.auditSource ?? 'storage:leave-attachments',
        auditBatchId: record.auditBatchId ?? undefined,
    };
}

function toMetadataRecord(
    value: PrismaJsonValue | null | undefined,
): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    return value as Record<string, unknown>;
}
