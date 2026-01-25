'use client';

import { useCallback, useState } from 'react';
import { z } from 'zod';

const presignResponseSchema = z.object({
    uploadUrl: z.url(),
    storageKey: z.string().min(1),
    headers: z.record(z.string(), z.string()),
    expiresAt: z.string().min(1),
});

const MAX_ABSENCE_ATTACHMENT_BYTES = 50 * 1024 * 1024;

export interface UploadedAbsenceAttachment {
    fileName: string;
    contentType: string;
    fileSize: number;
    storageKey: string;
}

export interface UseAbsenceAttachmentUploadReturn {
    uploading: boolean;
    uploadError: string | null;
    uploadAttachment: (file: File) => Promise<UploadedAbsenceAttachment | null>;
    resetUploadError: () => void;
}

function isAllowedAttachmentType(contentType: string): boolean {
    const normalized = contentType.toLowerCase();
    return normalized === 'application/pdf' || normalized.startsWith('image/');
}

export function useAbsenceAttachmentUpload(absenceId: string): UseAbsenceAttachmentUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const resetUploadError = useCallback(() => {
        setUploadError(null);
    }, []);

    const uploadAttachment = useCallback(async (file: File) => {
        const contentType = file.type || 'application/octet-stream';
        if (!isAllowedAttachmentType(contentType)) {
            setUploadError('Attachments must be PDF or image files.');
            return null;
        }

        if (file.size > MAX_ABSENCE_ATTACHMENT_BYTES) {
            setUploadError('Attachment must be under 50 MB.');
            return null;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const presignResponse = await fetch(`/api/hr/absences/${absenceId}/attachments/presign`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType,
                    fileSize: file.size,
                }),
            });

            if (!presignResponse.ok) {
                const errorText = await presignResponse.text();
                throw new Error(errorText || 'Unable to prepare upload.');
            }

            const presignPayload = presignResponseSchema.parse(await presignResponse.json());

            const putResponse = await fetch(presignPayload.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: presignPayload.headers,
            });

            if (!putResponse.ok) {
                const errorText = await putResponse.text();
                throw new Error(errorText || 'Upload failed.');
            }

            return {
                fileName: file.name,
                contentType,
                fileSize: file.size,
                storageKey: presignPayload.storageKey,
            };
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Unable to upload attachment.');
            return null;
        } finally {
            setUploading(false);
        }
    }, [absenceId]);

    return {
        uploading,
        uploadError,
        uploadAttachment,
        resetUploadError,
    };
}
