'use client';

import { useActionState, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import {
    cancelOffboardingAction,
    completeOffboardingAction,
    startOffboardingAction,
    type OffboardingActionState,
} from '@/app/(app)/hr/offboarding/actions';
import {
    formatOffboardingStatus,
    resolveOffboardingStatusVariant,
} from './employee-offboarding-card.helpers';
import { OffboardingActions, OffboardingStartForm } from './employee-offboarding-card.forms';
import { OffboardingSummarySection } from './employee-offboarding-card.summary';
import type { ChecklistProgressInfo } from './employee-offboarding-card.types';

export interface EmployeeOffboardingCardProps {
    profileId: string;
    offboardingId: string | null;
    status: OffboardingRecord['status'] | null;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    checklistProgress: ChecklistProgressInfo | null;
    templates: { id: string; name: string }[];
    canStart: boolean;
    canComplete: boolean;
}

const INITIAL_STATE: OffboardingActionState = { status: 'idle' };

export function EmployeeOffboardingCard({
    profileId,
    offboardingId,
    status,
    startedAt,
    completedAt,
    checklistProgress,
    templates,
    canStart,
    canComplete,
}: EmployeeOffboardingCardProps) {
    const [mode, setMode] = useState<'DIRECT' | 'CHECKLIST'>('DIRECT');
    const [startState, startAction, startPending] = useActionState<OffboardingActionState, FormData>(
        startOffboardingAction,
        INITIAL_STATE,
    );
    const [completeState, completeAction, completePending] = useActionState<OffboardingActionState, FormData>(
        completeOffboardingAction,
        INITIAL_STATE,
    );
    const [cancelState, cancelAction, cancelPending] = useActionState<OffboardingActionState, FormData>(
        cancelOffboardingAction,
        INITIAL_STATE,
    );

    const statusLabel = status ? formatOffboardingStatus(status) : 'Not started';
    const statusVariant = status ? resolveOffboardingStatusVariant(status) : 'outline';
    const checklistUnavailable = mode === 'CHECKLIST' && templates.length === 0;
    const showActions = status === 'IN_PROGRESS' && Boolean(offboardingId);
    const emptyState = canStart
        ? 'Start an offboarding workflow to archive this employee and revoke access.'
        : 'Offboarding is unavailable for archived or already-offboarding employees.';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    <span>Offboarding</span>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                </CardTitle>
                <CardDescription>
                    Manage offboarding workflows and access removal.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {status ? (
                    <OffboardingSummarySection
                        profileId={profileId}
                        startedAt={startedAt}
                        completedAt={completedAt}
                        checklistProgress={checklistProgress}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground">{emptyState}</p>
                )}

                {canStart ? (
                    <OffboardingStartForm
                        profileId={profileId}
                        mode={mode}
                        templates={templates}
                        checklistUnavailable={checklistUnavailable}
                        startPending={startPending}
                        startState={startState}
                        onModeChange={setMode}
                        startAction={startAction}
                    />
                ) : null}

                {showActions && offboardingId ? (
                    <OffboardingActions
                        offboardingId={offboardingId}
                        canComplete={canComplete}
                        completePending={completePending}
                        cancelPending={cancelPending}
                        completeState={completeState}
                        cancelState={cancelState}
                        completeAction={completeAction}
                        cancelAction={cancelAction}
                    />
                ) : null}
            </CardContent>
        </Card>
    );
}
