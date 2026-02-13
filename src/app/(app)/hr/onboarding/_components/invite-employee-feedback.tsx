'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

import type { OnboardingInviteFormState } from '../form-state';

interface InviteEmployeeFeedbackProps {
    state: OnboardingInviteFormState;
    feedbackReference: React.RefObject<HTMLDivElement | null>;
}

export function InviteEmployeeFeedback({
    state,
    feedbackReference,
}: InviteEmployeeFeedbackProps) {
    if (state.status === 'idle') {
        return null;
    }

    const isSuccess = state.status === 'success';

    return (
        <div ref={feedbackReference} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true">
            <Alert variant={isSuccess ? 'default' : 'destructive'}>
                <AlertTitle>{isSuccess ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>
                    {state.message ?? 'Something went wrong.'}
                    {isSuccess && state.token ? (
                        <div className="mt-2 space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Invitation token</div>
                            <Input readOnly value={state.token} aria-label="Invitation token" />
                        </div>
                    ) : null}
                </AlertDescription>
            </Alert>
        </div>
    );
}
