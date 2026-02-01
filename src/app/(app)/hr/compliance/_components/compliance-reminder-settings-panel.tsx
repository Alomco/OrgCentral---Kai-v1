import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getComplianceReminderSettingsForUi } from '@/server/use-cases/hr/compliance/get-compliance-reminder-settings.cached';
import { ComplianceReminderSettingsForm } from './compliance-reminder-settings-form';

interface ComplianceReminderSettingsPanelProps {
    authorization: RepositoryAuthorizationContext;
}

export async function ComplianceReminderSettingsPanel({ authorization }: ComplianceReminderSettingsPanelProps) {
    const result = await getComplianceReminderSettingsForUi({ authorization });

    return (
        <ComplianceReminderSettingsForm
            defaults={{
                windowDays: result.settings.windowDays,
                escalationDays: result.settings.escalationDays,
                notifyOnComplete: result.settings.notifyOnComplete,
            }}
        />
    );
}
