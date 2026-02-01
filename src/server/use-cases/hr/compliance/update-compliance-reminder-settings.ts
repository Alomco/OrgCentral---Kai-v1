import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceReminderSettingsRepository } from '@/server/repositories/contracts/hr/compliance/compliance-reminder-settings-repository-contract';
import type { ComplianceReminderSettingsInput, ComplianceReminderSettings } from '@/server/types/hr/compliance-reminder-settings';
import { recordAuditEvent } from '@/server/logging/audit-logger';

export interface UpdateComplianceReminderSettingsInput {
    authorization: RepositoryAuthorizationContext;
    payload: ComplianceReminderSettingsInput;
}

export interface UpdateComplianceReminderSettingsDependencies {
    complianceReminderSettingsRepository: IComplianceReminderSettingsRepository;
}

export interface UpdateComplianceReminderSettingsResult {
    settings: ComplianceReminderSettings;
}

export async function updateComplianceReminderSettings(
    deps: UpdateComplianceReminderSettingsDependencies,
    input: UpdateComplianceReminderSettingsInput,
): Promise<UpdateComplianceReminderSettingsResult> {
    const settings = await deps.complianceReminderSettingsRepository.upsertSettings(
        input.authorization.orgId,
        input.payload,
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'POLICY_CHANGE',
        action: 'hr.compliance.reminders.updated',
        resource: 'hr.compliance.reminders',
        resourceId: settings.orgId,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        payload: {
            windowDays: settings.windowDays,
            escalationDays: settings.escalationDays,
            notifyOnComplete: settings.notifyOnComplete,
        },
    });

    return { settings };
}
