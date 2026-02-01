import type { ComplianceReminderSettings, ComplianceReminderSettingsInput } from '@/server/types/hr/compliance-reminder-settings';

export interface IComplianceReminderSettingsRepository {
    getSettings(orgId: string): Promise<ComplianceReminderSettings | null>;
    upsertSettings(orgId: string, input: ComplianceReminderSettingsInput): Promise<ComplianceReminderSettings>;
}
