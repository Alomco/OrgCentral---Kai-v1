import { readFormString } from '../employees/action-helpers';

export function buildIntegrationCandidate(formData: FormData) {
    return {
        googleEnabled: formData.get('googleEnabled') === 'on',
        googleCalendarId: readFormString(formData, 'googleCalendarId'),
        googleServiceAccountEmail: readFormString(formData, 'googleServiceAccountEmail'),
        googleSyncWindowDays: formData.get('googleSyncWindowDays'),
        m365Enabled: formData.get('m365Enabled') === 'on',
        m365TenantId: readFormString(formData, 'm365TenantId'),
        m365CalendarId: readFormString(formData, 'm365CalendarId'),
        m365SyncWindowDays: formData.get('m365SyncWindowDays'),
        lmsEnabled: formData.get('lmsEnabled') === 'on',
        lmsProviderName: readFormString(formData, 'lmsProviderName'),
        lmsBaseUrl: readFormString(formData, 'lmsBaseUrl'),
        lmsApiTokenLabel: readFormString(formData, 'lmsApiTokenLabel'),
        lmsSyncWindowDays: formData.get('lmsSyncWindowDays'),
    };
}

export function buildIntegrationStatus(existingStatus: string | null, enabled: boolean): string | null {
    if (!enabled) {
        return 'disabled';
    }
    if (!existingStatus || existingStatus === 'disabled') {
        return 'configured';
    }
    return existingStatus;
}
