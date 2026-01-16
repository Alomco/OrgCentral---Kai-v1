'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface AbsenceRequest {
    id: string;
    employeeName: string;
    type: string;
    startDate: Date;
    endDate: Date;
    reason?: string;
}

interface AbsenceApprovalDialogProps {
    request: AbsenceRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove?: (id: string, comments: string) => Promise<void>;
    onReject?: (id: string, reason: string) => Promise<void>;
}

function formatDateRange(start: Date, end: Date): string {
    const startString = start.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const endString = end.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    if (startString === endString) { return startString; }
    return `${startString} - ${endString}`;
}

function getDayCount(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / 86400000) + 1;
}

export function AbsenceApprovalDialog({
    request,
    open,
    onOpenChange,
    onApprove,
    onReject,
}: AbsenceApprovalDialogProps) {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        if (!request || !onApprove) { return; }
        setIsSubmitting(true);
        try {
            await onApprove(request.id, comments);
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!request || !onReject) { return; }
        if (!comments.trim()) {
            setAction('reject');
            return;
        }
        setIsSubmitting(true);
        try {
            await onReject(request.id, comments);
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setAction(null);
        setComments('');
        onOpenChange(false);
    };

    if (!request) { return null; }

    const dayCount = getDayCount(request.startDate, request.endDate);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Absence Request Review</DialogTitle>
                    <DialogDescription>
                        Review and respond to this absence request
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Request Details */}
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{request.employeeName}</span>
                            <Badge variant="secondary">{request.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>{formatDateRange(request.startDate, request.endDate)}</p>
                            <p className="text-xs">
                                {dayCount} day{dayCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {request.reason ? (
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground">Reason:</p>
                                <p className="text-sm">{request.reason}</p>
                            </div>
                        ) : null}
                    </div>

                    {/* Comments/Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="comments">
                            {action === 'reject' ? 'Rejection Reason *' : 'Comments (optional)'}
                        </Label>
                        <Textarea
                            id="comments"
                            placeholder={
                                action === 'reject'
                                    ? 'Please provide a reason for rejection...'
                                    : 'Add any comments...'
                            }
                            value={comments}
                            onChange={(event) => setComments(event.target.value)}
                            rows={3}
                        />
                        {action === 'reject' && !comments.trim() ? (
                            <p className="text-xs text-destructive">
                                A reason is required when rejecting a request
                            </p>
                        ) : null}
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isSubmitting || (action === 'reject' && !comments.trim())}
                    >
                        {isSubmitting && action === 'reject' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                    </Button>
                    <Button onClick={handleApprove} disabled={isSubmitting}>
                        {isSubmitting && action === 'approve' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
