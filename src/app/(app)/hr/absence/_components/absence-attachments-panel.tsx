'use client';

import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { Paperclip, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { AbsenceAttachment, UnplannedAbsence } from '@/server/types/hr-ops-types';
import { formatHumanDate } from '../../_components/format-date';
import { useAbsenceAttachmentUpload } from './use-absence-attachment-upload';

export interface AbsenceAttachmentsPanelProps {
    absenceId: string;
    attachments: AbsenceAttachment[];
    onAbsenceUpdated: (absence: UnplannedAbsence) => void;
    disabled?: boolean;
}

function formatSize(bytes: number): string {
    if (!Number.isFinite(bytes)) {
        return '--';
    }
    if (bytes < 1024) {
        return `${bytes.toString()} B`;
    }
    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
}

export function AbsenceAttachmentsPanel({
    absenceId,
    attachments,
    onAbsenceUpdated,
    disabled = false,
}: AbsenceAttachmentsPanelProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [fileInputKey, setFileInputKey] = useState(0);
    const { uploading, uploadError, uploadAttachment, resetUploadError } = useAbsenceAttachmentUpload(absenceId);

    const errorMessage = uploadError ?? actionError;

    const sortedAttachments = useMemo(
        () => [...attachments].sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime()),
        [attachments],
    );

    const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setSelectedFile(event.target.files?.[0] ?? null);
        setActionError(null);
        resetUploadError();
    }, [resetUploadError]);

    const handleSubmit = useCallback(async () => {
        if (!selectedFile) {
            setActionError('Select a PDF or image file to upload.');
            return;
        }

        setIsSubmitting(true);
        setActionError(null);

        try {
            const uploaded = await uploadAttachment(selectedFile);
            if (!uploaded) {
                return;
            }

            const response = await fetch(`/api/hr/absences/${absenceId}/attachments`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    attachments: [uploaded],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Unable to attach evidence.');
            }

            const result = (await response.json()) as { absence: UnplannedAbsence };
            onAbsenceUpdated(result.absence);
            setSelectedFile(null);
            setFileInputKey((value) => value + 1);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : 'Unable to attach evidence.');
        } finally {
            setIsSubmitting(false);
        }
    }, [absenceId, onAbsenceUpdated, selectedFile, uploadAttachment]);

    const handleRemove = useCallback(async (attachmentId: string) => {
        setIsSubmitting(true);
        setActionError(null);

        try {
            const response = await fetch(`/api/hr/absences/${absenceId}/attachments`, {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ attachmentId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Unable to remove attachment.');
            }

            const result = (await response.json()) as { absence: UnplannedAbsence };
            onAbsenceUpdated(result.absence);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : 'Unable to remove attachment.');
        } finally {
            setIsSubmitting(false);
        }
    }, [absenceId, onAbsenceUpdated]);

    return (
        <div className="space-y-3">
            <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    Evidence attachments
                </div>
                <p className="text-xs text-muted-foreground">
                    Upload PDF or image evidence securely to Azure storage.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="absence-attachment-file">File</Label>
                <Input
                    key={fileInputKey}
                    id="absence-attachment-file"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    disabled={disabled || isSubmitting || uploading}
                />
            </div>

            {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}

            <Button
                type="button"
                variant="outline"
                onClick={handleSubmit}
                disabled={disabled || isSubmitting || uploading}
                className="w-full"
            >
                {isSubmitting || uploading ? 'Uploading...' : 'Upload attachment'}
            </Button>

            <Separator />

            <div className="space-y-2">
                {sortedAttachments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No attachments uploaded yet.</p>
                ) : (
                    sortedAttachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                        >
                            <div className="space-y-1">
                                <div className="font-medium">
                                    <a
                                        href={`/api/hr/absences/${absenceId}/attachments/${attachment.id}/download`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline underline-offset-4"
                                    >
                                        {attachment.fileName}
                                    </a>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatSize(attachment.fileSize)} � Uploaded {formatHumanDate(new Date(attachment.uploadedAt))}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(attachment.id)}
                                disabled={disabled || isSubmitting}
                                aria-label={`Remove ${attachment.fileName}`}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
