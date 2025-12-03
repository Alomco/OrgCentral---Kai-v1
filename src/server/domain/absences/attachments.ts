import {
    AbsenceAttachmentNotFoundError,
    AbsenceAttachmentTypeError,
    AbsenceAttachmentSizeError,
} from '@/server/errors/hr-absences';
import type { AbsenceAttachment } from '@/server/types/hr-ops-types';

export const SUPPORTED_ANALYSIS_MIME_PREFIXES = ['image/', 'application/pdf'] as const;
export const MAX_ANALYSIS_BYTES = 25 * 1024 * 1024; // 25 MB inline limit for Gemini

export function selectAttachment(attachments: AbsenceAttachment[], attachmentId?: string): AbsenceAttachment {
    if (attachments.length === 0) {
        throw new AbsenceAttachmentNotFoundError('No attachments available for analysis.');
    }

    if (attachmentId) {
        const match = attachments.find((item) => item.id === attachmentId);
        if (!match) {
            throw new AbsenceAttachmentNotFoundError('Attachment not found for the provided id.', {
                attachmentId,
            });
        }
        return match;
    }

    const sorted = [...attachments].sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());
    return sorted[sorted.length - 1];
}

export function assertAttachmentAnalyzable(attachment: AbsenceAttachment): void {
    if (!SUPPORTED_ANALYSIS_MIME_PREFIXES.some((prefix) => attachment.contentType.startsWith(prefix))) {
        throw new AbsenceAttachmentTypeError(attachment.contentType);
    }
    if (attachment.fileSize > MAX_ANALYSIS_BYTES) {
        throw new AbsenceAttachmentSizeError(attachment.fileSize, MAX_ANALYSIS_BYTES);
    }
}
