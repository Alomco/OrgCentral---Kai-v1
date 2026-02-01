import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type { JsonRecord } from '@/server/types/json';

export interface ComplianceReminderSettings {
    orgId: string;
    windowDays: number;
    escalationDays: number[];
    notifyOnComplete: boolean;
    dataClassification: DataClassificationLevel;
    dataResidency: DataResidencyZone;
    metadata?: JsonRecord | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ComplianceReminderSettingsInput {
    windowDays: number;
    escalationDays: number[];
    notifyOnComplete: boolean;
    metadata?: JsonRecord | null;
}
