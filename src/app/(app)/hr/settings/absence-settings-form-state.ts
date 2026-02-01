import type { AbsenceSettingsFormValues } from './absence-settings-schema';

export interface AbsenceSettingsFormState {
    status: 'idle' | 'success' | 'error';
    message?: string;
    fieldErrors?: Partial<Record<keyof AbsenceSettingsFormValues, string>>;
    values: AbsenceSettingsFormValues;
}

export function buildInitialAbsenceSettingsFormState(
    values: AbsenceSettingsFormValues,
): AbsenceSettingsFormState {
    return {
        status: 'idle',
        values,
    };
}
