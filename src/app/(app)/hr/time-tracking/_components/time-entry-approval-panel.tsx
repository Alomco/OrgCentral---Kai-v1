'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

import { approveTimeEntryAction, rejectTimeEntryAction } from '../actions';

export interface PendingTimeEntry {
    id: string;
    employeeName: string;
    date: Date;
    clockIn: Date;
    clockOut?: Date | null;
    totalHours?: number | null;
    project?: string | null;
}

export function TimeEntryApprovalPanel({
    authorization,
    entries,
}: {
    authorization: RepositoryAuthorizationContext;
    entries: PendingTimeEntry[];
}) {
    const router = useRouter();
    const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDecision = (entryId: string, decision: 'approve' | 'reject') => {
        setActiveEntryId(entryId);
        startTransition(() => {
            const action = decision === 'approve' ? approveTimeEntryAction : rejectTimeEntryAction;
            void action(authorization, entryId)
                .then(() => router.refresh())
                .catch(() => null)
                .finally(() => setActiveEntryId(null));
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timesheet Approvals
                    </CardTitle>
                    <CardDescription>Completed entries awaiting review.</CardDescription>
                </div>
                {entries.length > 0 ? <Badge variant="secondary">{entries.length}</Badge> : null}
            </CardHeader>
            <CardContent className="space-y-3">
                {entries.length > 0 ? (
                    entries.map((entry) => (
                        <div key={entry.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm truncate">{entry.employeeName}</p>
                                    {entry.project ? (
                                        <Badge variant="outline" className="text-xs">
                                            {entry.project}
                                        </Badge>
                                    ) : null}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {entry.totalHours ? ` | ${entry.totalHours.toFixed(2)}h` : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={isPending && activeEntryId === entry.id}
                                    onClick={() => handleDecision(entry.id, 'reject')}
                                >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={isPending && activeEntryId === entry.id}
                                    onClick={() => handleDecision(entry.id, 'approve')}
                                >
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium">No pending entries</p>
                        <p className="text-xs text-muted-foreground">
                            Completed time entries will appear here for approval.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
