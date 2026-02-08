'use client';

import { useCallback, useMemo, useState } from 'react';
import { Bot, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AbsenceMetadata } from '@/server/domain/absences/metadata';
import type { AbsenceAttachment, UnplannedAbsence } from '@/server/types/hr-ops-types';

export interface AbsenceAiValidationPanelProps {
    absenceId: string;
    metadata: AbsenceMetadata;
    attachments: AbsenceAttachment[];
    onAbsenceUpdated: (absence: UnplannedAbsence) => void;
    disabled?: boolean;
}

const STATUS_TONES: Record<string, string> = {
    PENDING: 'bg-secondary/60 text-secondary-foreground',
    VERIFIED: 'bg-success/15 text-success',
    MISMATCH: 'bg-warning/15 text-warning',
    ERROR: 'bg-destructive/15 text-destructive',
};

export function AbsenceAiValidationPanel({
    absenceId,
    metadata,
    attachments,
    onAbsenceUpdated,
    disabled = false,
}: AbsenceAiValidationPanelProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const latestAttachment = useMemo(() => {
        if (attachments.length === 0) {
            return null;
        }
        return [...attachments].sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime()).pop() ?? null;
    }, [attachments]);

    const aiValidation = metadata.aiValidation;
    const statusTone = aiValidation?.status ? STATUS_TONES[aiValidation.status] : undefined;

    const handleAnalyze = useCallback(async () => {
        if (!latestAttachment) {
            setErrorMessage('Upload evidence before running AI validation.');
            return;
        }

        setIsRunning(true);
        setErrorMessage(null);

        try {
            const shouldForce = Boolean(aiValidation?.status && aiValidation.status !== 'ERROR');
            const response = await fetch(`/api/hr/absences/${absenceId}/ai`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    attachmentId: latestAttachment.id,
                    force: shouldForce,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Unable to run AI validation.');
            }

            const result = (await response.json()) as { absence: UnplannedAbsence };
            onAbsenceUpdated(result.absence);
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to run AI validation.');
        } finally {
            setIsRunning(false);
        }
    }, [absenceId, aiValidation?.status, latestAttachment, onAbsenceUpdated]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    AI validation
                </div>
                {aiValidation?.status ? (
                    <Badge className={statusTone ?? ''}>{aiValidation.status}</Badge>
                ) : (
                    <Badge variant="outline">Not run</Badge>
                )}
            </div>

            {aiValidation?.summary ? (
                <p className="text-xs text-muted-foreground">{aiValidation.summary}</p>
            ) : null}

            {aiValidation?.issues && aiValidation.issues.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                    {aiValidation.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                    ))}
                </ul>
            ) : null}

            {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}

            <Button
                type="button"
                variant="outline"
                onClick={handleAnalyze}
                disabled={disabled || isRunning || !latestAttachment}
                className="w-full justify-center gap-2"
            >
                <ShieldCheck className="h-4 w-4" />
                {isRunning ? 'Validating…' : 'Run AI validation'}
            </Button>
        </div>
    );
}
