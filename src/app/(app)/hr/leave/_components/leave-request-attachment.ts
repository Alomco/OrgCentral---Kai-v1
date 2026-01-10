'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';

interface Attachment {
    fileName: string;
    contentType: string;
    fileSize: number;
    storageKey: string;
    checksum?: string;
}

export interface UseLeaveAttachmentReturn {
    uploading: boolean;
    uploadError: string | null;
    uploadedAttachments: Attachment[];
    attachmentsValue: string;
    handleEvidenceChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function useLeaveAttachment(requestId: string): UseLeaveAttachmentReturn {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);

    async function handleEvidenceChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) {
            setUploadedAttachments([]);
            setUploadError(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Attachment must be under 5 MB.');
            setUploadedAttachments([]);
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const presignResponse = await fetch('/api/hr/leave/attachments/presign', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    fileName: file.name,
                    contentType: file.type || 'application/octet-stream',
                    fileSize: file.size,
                }),
            });

            if (!presignResponse.ok) {
                const errorText = await presignResponse.text();
                throw new Error(errorText || 'Unable to prepare upload.');
            }

            const { uploadUrl, headers, storageKey } = (await presignResponse.json()) as {
                uploadUrl: string;
                storageKey: string;
                headers: Record<string, string>;
            };

            const putResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers,
            });

            if (!putResponse.ok) {
                const errorText = await putResponse.text();
                throw new Error(errorText || 'Upload failed.');
            }

            setUploadedAttachments([
                {
                    fileName: file.name,
                    contentType: file.type || 'application/octet-stream',
                    fileSize: file.size,
                    storageKey,
                },
            ]);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Unable to upload attachment.');
            setUploadedAttachments([]);
        } finally {
            setUploading(false);
        }
    }

    return {
        uploading,
        uploadError,
        uploadedAttachments,
        attachmentsValue: JSON.stringify(uploadedAttachments),
        handleEvidenceChange,
    };
}
