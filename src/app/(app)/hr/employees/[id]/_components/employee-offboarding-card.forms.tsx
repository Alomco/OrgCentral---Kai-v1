import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OffboardingActionState } from '@/app/(app)/hr/offboarding/actions';

interface OffboardingStartFormProps {
    profileId: string;
    mode: 'DIRECT' | 'CHECKLIST';
    templates: { id: string; name: string }[];
    checklistUnavailable: boolean;
    startPending: boolean;
    startState: OffboardingActionState;
    onModeChange: (mode: 'DIRECT' | 'CHECKLIST') => void;
    startAction: (formData: FormData) => void;
}

export function OffboardingStartForm({
    profileId,
    mode,
    templates,
    checklistUnavailable,
    startPending,
    startState,
    onModeChange,
    startAction,
}: OffboardingStartFormProps) {
    const statusMessage = resolveStartMessage(startState, checklistUnavailable);

    return (
        <form action={startAction} className="space-y-4">
            <input type="hidden" name="profileId" value={profileId} />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor="offboarding-mode"
                    >
                        Offboarding mode
                    </label>
                    <select
                        id="offboarding-mode"
                        name="mode"
                        value={mode}
                        onChange={(event) =>
                            onModeChange(event.target.value as 'DIRECT' | 'CHECKLIST')
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="DIRECT">Direct archive</option>
                        <option value="CHECKLIST">Checklist-based</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor="offboarding-template"
                    >
                        Checklist template
                    </label>
                    <select
                        id="offboarding-template"
                        name="templateId"
                        disabled={mode !== 'CHECKLIST'}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="">Select template</option>
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor="offboarding-reason"
                >
                    Offboarding reason
                </label>
                <Textarea id="offboarding-reason" name="reason" rows={3} required />
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="submit"
                    size="sm"
                    disabled={startPending || checklistUnavailable}
                >
                    {startPending ? 'Starting...' : 'Start offboarding'}
                </Button>
                <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {statusMessage}
                </span>
            </div>
        </form>
    );
}

interface OffboardingActionsProps {
    offboardingId: string;
    canComplete: boolean;
    completePending: boolean;
    cancelPending: boolean;
    completeState: OffboardingActionState;
    cancelState: OffboardingActionState;
    completeAction: (formData: FormData) => void;
    cancelAction: (formData: FormData) => void;
}

export function OffboardingActions({
    offboardingId,
    canComplete,
    completePending,
    cancelPending,
    completeState,
    cancelState,
    completeAction,
    cancelAction,
}: OffboardingActionsProps) {
    const completeMessage = resolveCompleteMessage(completeState, canComplete);
    const cancelMessage = resolveCancelMessage(cancelState);

    return (
        <div className="space-y-4">
            <form action={completeAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="offboardingId" value={offboardingId} />
                <Button type="submit" size="sm" disabled={completePending || !canComplete}>
                    {completePending ? 'Completing...' : 'Complete offboarding'}
                </Button>
                <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {completeMessage}
                </span>
            </form>

            <form action={cancelAction} className="space-y-2">
                <input type="hidden" name="offboardingId" value={offboardingId} />
                <label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor="offboarding-cancel-reason"
                >
                    Cancel reason (optional)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        id="offboarding-cancel-reason"
                        name="reason"
                        placeholder="Reason for cancellation"
                    />
                    <Button type="submit" size="sm" variant="outline" disabled={cancelPending}>
                        {cancelPending ? 'Cancelling...' : 'Cancel offboarding'}
                    </Button>
                </div>
                <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {cancelMessage}
                </span>
            </form>
        </div>
    );
}

function resolveStartMessage(
    state: OffboardingActionState,
    checklistUnavailable: boolean,
) {
    if (state.status === 'error') {
        return state.message ?? 'Unable to start offboarding.';
    }
    if (state.status === 'success') {
        return state.message ?? 'Offboarding started.';
    }
    if (checklistUnavailable) {
        return 'No offboarding templates available.';
    }
    return 'Choose a mode to proceed.';
}

function resolveCompleteMessage(
    state: OffboardingActionState,
    canComplete: boolean,
) {
    if (state.status === 'error') {
        return state.message ?? 'Unable to complete offboarding.';
    }
    if (state.status === 'success') {
        return state.message ?? 'Offboarding completed.';
    }
    return canComplete
        ? 'Ready to complete once you confirm.'
        : 'Checklist must be completed before finishing.';
}

function resolveCancelMessage(state: OffboardingActionState) {
    if (state.status === 'error') {
        return state.message ?? 'Unable to cancel offboarding.';
    }
    if (state.status === 'success') {
        return state.message ?? 'Offboarding cancelled.';
    }
    return 'Cancellation restores the employee to active status.';
}
