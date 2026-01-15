import { DataClassificationLevel, DataResidencyZone } from '@/server/types/prisma';

export type OrgScopePolicy = 'strict' | 'create-only' | 'none';

export interface TenantScopedModelConfig {
    orgField: string;
    orgRequired: boolean;
    scopePolicy: OrgScopePolicy;
    classificationField?: string;
    residencyField?: string;
}

export const DEFAULT_CLASSIFICATION = DataClassificationLevel.OFFICIAL;
export const DEFAULT_RESIDENCY = DataResidencyZone.UK_ONLY;

const ORG_FIELD = 'orgId';
const CLASSIFICATION_FIELD = 'dataClassification';
const RESIDENCY_FIELD = 'residencyTag';

const COMPLIANCE_FIELDS: Pick<
    TenantScopedModelConfig,
    'classificationField' | 'residencyField'
> = {
    classificationField: CLASSIFICATION_FIELD,
    residencyField: RESIDENCY_FIELD,
};

const createOnlyConfig = (
    overrides: Partial<TenantScopedModelConfig> = {},
): TenantScopedModelConfig => ({
    orgField: ORG_FIELD,
    orgRequired: true,
    scopePolicy: 'create-only',
    ...overrides,
});

const strictConfig = (
    overrides: Partial<TenantScopedModelConfig> = {},
): TenantScopedModelConfig => ({
    orgField: ORG_FIELD,
    orgRequired: true,
    scopePolicy: 'strict',
    ...overrides,
});

const noneConfig = (
    overrides: Partial<TenantScopedModelConfig> = {},
): TenantScopedModelConfig => ({
    orgField: ORG_FIELD,
    orgRequired: false,
    scopePolicy: 'none',
    ...overrides,
});

export const TENANT_SCOPED_MODELS: Record<string, TenantScopedModelConfig> = {
    Invitation: createOnlyConfig(),
    SecurityEvent: noneConfig(),
    OrganizationSubscription: createOnlyConfig(COMPLIANCE_FIELDS),
    PaymentMethod: createOnlyConfig(COMPLIANCE_FIELDS),
    BillingInvoice: createOnlyConfig(COMPLIANCE_FIELDS),
    HRNotification: strictConfig(COMPLIANCE_FIELDS),
    EmployeeProfile: createOnlyConfig(COMPLIANCE_FIELDS),
    EmploymentContract: createOnlyConfig(COMPLIANCE_FIELDS),
    LeavePolicy: createOnlyConfig(COMPLIANCE_FIELDS),
    LeaveBalance: createOnlyConfig(COMPLIANCE_FIELDS),
    LeaveRequest: createOnlyConfig(COMPLIANCE_FIELDS),
    LeaveAttachment: createOnlyConfig(COMPLIANCE_FIELDS),
    PerformanceReview: createOnlyConfig(),
    PerformanceGoal: createOnlyConfig(),
    TrainingRecord: createOnlyConfig(),
    AbsenceTypeConfig: strictConfig(),
    AbsenceSettings: strictConfig(),
    HRSettings: createOnlyConfig(COMPLIANCE_FIELDS),
    UnplannedAbsence: strictConfig(COMPLIANCE_FIELDS),
    AbsenceAttachment: strictConfig(COMPLIANCE_FIELDS),
    AbsenceReturnRecord: strictConfig(COMPLIANCE_FIELDS),
    AbsenceDeletionAudit: strictConfig(COMPLIANCE_FIELDS),
    TimeEntry: createOnlyConfig(COMPLIANCE_FIELDS),
    HRPolicy: createOnlyConfig(COMPLIANCE_FIELDS),
    PolicyAcknowledgment: createOnlyConfig(),
    ChecklistTemplate: createOnlyConfig(),
    ChecklistInstance: createOnlyConfig(),
    ComplianceTemplate: createOnlyConfig(),
    ComplianceCategory: createOnlyConfig(),
    ComplianceLogItem: createOnlyConfig(),
    NotificationMessage: createOnlyConfig(COMPLIANCE_FIELDS),
    ManagedOrganization: createOnlyConfig(),
    DocumentVault: createOnlyConfig(),
    AuditLog: createOnlyConfig(),
    EventOutbox: createOnlyConfig(),
    ComplianceRecord: createOnlyConfig(),
    StatutoryReport: createOnlyConfig(),
    DataSubjectRight: createOnlyConfig(),
    Location: createOnlyConfig(),
    Role: createOnlyConfig(),
    PermissionResource: createOnlyConfig(),
    Department: createOnlyConfig(),
    Membership: createOnlyConfig(),
    NotificationPreference: createOnlyConfig(),
    IntegrationConfig: createOnlyConfig(),
};

export function getTenantScopedModelConfig(model: string): TenantScopedModelConfig | undefined {
    return TENANT_SCOPED_MODELS[model];
}

export const TENANT_SCOPED_MODEL_NAMES = Object.freeze(Object.keys(TENANT_SCOPED_MODELS));
