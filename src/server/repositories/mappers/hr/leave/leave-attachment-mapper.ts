import type { LeaveAttachment } from '@/server/types/leave-types';
import type { LeaveAttachment as PrismaLeaveAttachment } from '@prisma/client';

export function mapLeaveAttachmentFromPrisma(record: PrismaLeaveAttachment): LeaveAttachment {
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
        metadata: record.metadata as Record<string, unknown> | null,
        dataClassification: record.dataClassification,
        dataResidency: record.residencyTag,
        auditSource: record.auditSource ?? 'storage:leave-attachments',
        auditBatchId: record.auditBatchId ?? undefined,
    };
}
