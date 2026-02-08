'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';

export interface ReturnToWorkDialogProps {
    absenceId: string;
    startDate: Date;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAbsenceUpdated: (absence: UnplannedAbsence) => void;
}

function toDateInputValue(value: Date): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toISOString().slice(0, 10);
}

export function ReturnToWorkDialog({
    absenceId,
    startDate,
    open,
    onOpenChange,
    onAbsenceUpdated,
}: ReturnToWorkDialogProps) {
    const inputId = useId();
    const [returnDate, setReturnDate] = useState(() => toDateInputValue(new Date()));
    const [comments, setComments] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setReturnDate(toDateInputValue(new Date()));
            setComments('');
            setErrorMessage(null);
        }
    }, [open]);

    const handleSubmit = useCallback(async () => {
        setIsSaving(true);
        setErrorMessage(null);

        try {
            const normalizedDate = returnDate || toDateInputValue(new Date());
            const response = await fetch(`/api/hr/absences/${absenceId}/return-to-work`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    returnDate: normalizedDate,
                    comments: comments.trim().length > 0 ? comments.trim() : undefined,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Unable to record return to work.');
            }

            const result = (await response.json()) as { absence: UnplannedAbsence };
            onAbsenceUpdated(result.absence);
            onOpenChange(false);
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to record return to work.');
        } finally {
            setIsSaving(false);
        }
    }, [absenceId, comments, onAbsenceUpdated, onOpenChange, returnDate]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Record return to work
                    </DialogTitle>
                    <DialogDescription>
                        Close the absence by recording the return date and any notes.
                    </DialogDescription>
                </DialogHeader>

                {errorMessage ? (
                    <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${inputId}-return-date`}>Return date</Label>
                        <Input
                            id={`${inputId}-return-date`}
                            type="date"
                            value={returnDate}
                            min={toDateInputValue(startDate)}
                            onChange={(event) => setReturnDate(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`${inputId}-comments`}>Notes (optional)</Label>
                        <Textarea
                            id={`${inputId}-comments`}
                            value={comments}
                            onChange={(event) => setComments(event.target.value)}
                            rows={3}
                            placeholder="Add any return-to-work notes"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Record return'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
