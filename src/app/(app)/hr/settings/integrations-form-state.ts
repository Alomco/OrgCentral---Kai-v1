import type { FieldErrors } from '../_components/form-errors';
import type { HrIntegrationsDefaults, HrIntegrationsFormValues, HrIntegrationsStatus } from './integrations-schema';

export interface HrIntegrationsFormState {
    status: 'idle' | 'success' | 'error';
    message?: string;
    fieldErrors?: FieldErrors<HrIntegrationsFormValues>;
    values: HrIntegrationsFormValues;
    integrationStatus: HrIntegrationsStatus;
}

export function buildInitialHrIntegrationsFormState(defaults: HrIntegrationsDefaults): HrIntegrationsFormState {
    return {
        status: 'idle',
        fieldErrors: undefined,
        values: defaults.values,
        integrationStatus: defaults.status,
    };
}
