import type { HrSettingsFormValues } from './schema';

export interface HrSettingsFormState {
    status: 'idle' | 'success' | 'error';
    message?: string;
    values: HrSettingsFormValues;
}

export function buildInitialHrSettingsFormState(values: HrSettingsFormValues): HrSettingsFormState {
    return { status: 'idle', values };
}
