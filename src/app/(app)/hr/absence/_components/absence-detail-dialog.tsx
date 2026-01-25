'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, FileText, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { AbsenceMetadata } from '@/server/domain/absences/metadata';
import { coerceAbsenceMetadata } from '@/server/domain/absences/metadata';
import type { AbsenceAttachment, ReturnToWorkRecord, UnplannedAbsence } from '@/server/types/hr-ops-types';
import { formatHumanDate } from '../../_components/format-date';
import { AbsenceAttachmentsPanel } from './absence-attachments-panel';
import { AbsenceAiValidationPanel } from './absence-ai-validation-panel';
import type { AbsenceTypeLabelMap } from './absence-row';

export interface AbsenceDetailData {
    id: string;
    typeId: string;
    startDate: Date;
    endDate: Date;
    hours: number;
    reason: string | null;
    status: UnplannedAbsence['status'];
    createdAt: Date;
    attachments: AbsenceAttachment[];
    returnToWork: ReturnToWorkRecord | null;
    metadata: AbsenceMetadata;
}

export interface AbsenceDetailDialogProps {
    absence: AbsenceDetailData | null;
    typeLabels: AbsenceTypeLabelMap;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAbsenceUpdated?: (absence: AbsenceDetailData) => void;
}

const STATUS_STYLES: Record<string, string> = {
    REPORTED: 'bg-secondary/70 text-secondary-foreground',
    APPROVED: 'bg-accent/20 text-foreground',
    REJECTED: 'bg-destructive/10 text-destructive',
    CANCELLED: 'bg-muted/60 text-muted-foreground',
    CLOSED: 'bg-primary/10 text-primary',
};

function formatDate(date: Date): string {
    return formatHumanDate(new Date(date));
}

function DetailRow({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className="mt-0.5 text-sm">{children}</div>
            </div>
        </div>
    );
}

export function AbsenceDetailDialog({
    absence,
    typeLabels,
    open,
    onOpenChange,
    onAbsenceUpdated,
}: AbsenceDetailDialogProps) {
    const [localAbsence, setLocalAbsence] = useState(absence);

    useEffect(() => {
        setLocalAbsence(absence);
    }, [absence]);

    if (!localAbsence) { return null; }

    const typeInfo = typeLabels[localAbsence.typeId] ?? {
        label: localAbsence.typeId,
        emoji: '📋',
    };
    const typeEmoji = typeInfo.emoji ?? '📋';
    const statusStyle = STATUS_STYLES[localAbsence.status] ?? STATUS_STYLES.REPORTED;

    const handleAbsenceUpdated = (updated: UnplannedAbsence) => {
        const mapped: AbsenceDetailData = {
            id: updated.id,
            typeId: updated.typeId,
            startDate: updated.startDate,
            endDate: updated.endDate,
            hours: Number(updated.hours),
            reason: updated.reason ?? null,
            status: updated.status,
            createdAt: updated.createdAt,
            attachments: updated.attachments ?? [],
            returnToWork: updated.returnToWork ?? null,
            metadata: coerceAbsenceMetadata(updated.metadata),
        };
        setLocalAbsence(mapped);
        onAbsenceUpdated?.(mapped);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-lg">{typeEmoji}</span>
                        {typeInfo.label}
                    </DialogTitle>
                    <DialogDescription>
                        Absence details and status information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Badge className={cn('font-medium', statusStyle)}>
                            {localAbsence.status.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Reported {formatDate(localAbsence.createdAt)}
                        </span>
                    </div>

                    <Separator />

                    <div className="grid gap-4">
                        <DetailRow icon={Calendar} label="Period">
                            {formatDate(localAbsence.startDate)} — {formatDate(localAbsence.endDate)}
                        </DetailRow>

                        <DetailRow icon={Clock} label="Duration">
                            {localAbsence.hours.toFixed(1)} hours
                        </DetailRow>

                        {localAbsence.reason ? (
                            <DetailRow icon={FileText} label="Reason">
                                {localAbsence.reason}
                            </DetailRow>
                        ) : null}

                        {localAbsence.returnToWork ? (
                            <DetailRow icon={CheckCircle2} label="Return to work">
                                <div className="space-y-1">
                                    <div>{formatDate(localAbsence.returnToWork.returnDate)}</div>
                                    {localAbsence.returnToWork.comments ? (
                                        <div className="text-xs text-muted-foreground">
                                            {localAbsence.returnToWork.comments}
                                        </div>
                                    ) : null}
                                </div>
                            </DetailRow>
                        ) : null}

                        <DetailRow icon={Info} label="Reference ID">
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                                {localAbsence.id.slice(0, 8)}
                            </code>
                        </DetailRow>
                    </div>

                    <Separator />

                    <AbsenceAttachmentsPanel
                        absenceId={localAbsence.id}
                        attachments={localAbsence.attachments}
                        onAbsenceUpdated={handleAbsenceUpdated}
                    />

                    <Separator />

                    <AbsenceAiValidationPanel
                        absenceId={localAbsence.id}
                        metadata={localAbsence.metadata}
                        attachments={localAbsence.attachments}
                        onAbsenceUpdated={handleAbsenceUpdated}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
