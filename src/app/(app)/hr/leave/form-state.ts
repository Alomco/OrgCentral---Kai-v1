import type { LeaveRequestFormValues } from './schema';

export type LeaveRequestFormStatus = 'idle' | 'success' | 'error';

export interface LeaveRequestFormState {
    status: LeaveRequestFormStatus;
    message?: string;
    values: LeaveRequestFormValues;
}

export function buildInitialLeaveRequestFormState(
    values: LeaveRequestFormValues,
): LeaveRequestFormState {
    return { status: 'idle', values };
}
