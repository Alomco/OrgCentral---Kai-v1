import type { OrgPermissionMap, OrgRoleKey } from '@/server/security/access-control';
import type { OrgAccessContext, OrgAccessInput } from '@/server/security/guards';
import type { JsonRecord } from '@/server/types/json';
import type { DataClassificationLevel, DataResidencyZone, TenantScope } from '@/server/types/tenant';
import type { EnhancedSecurityContext } from './enhanced-security-types';

export type GuardEvaluator = (input: OrgAccessInput) => Promise<OrgAccessContext>;

export interface RepositoryAuthorizationDefaults {
    readonly requiredPermissions?: Readonly<OrgPermissionMap>;
    readonly expectedClassification?: OrgAccessInput['expectedClassification'];
    readonly expectedResidency?: OrgAccessInput['expectedResidency'];
    readonly auditSource?: string;
    readonly requiresMfa?: boolean;
    readonly piiAccessRequired?: boolean;
    readonly dataBreachRisk?: boolean;
}

export interface RepositoryAuthorizerOptions {
    readonly guard?: GuardEvaluator;
    readonly defaults?: RepositoryAuthorizationDefaults;
}

export interface RepositoryAuthorizationContext extends EnhancedSecurityContext {
    readonly roleKey: OrgRoleKey | 'custom';
    readonly tenantScope: TenantScope;
    readonly requiresMfa?: boolean;
    readonly piiAccessRequired?: boolean;
    readonly dataBreachRisk?: boolean;
    readonly sessionToken?: string;
    readonly authorizedAt?: Date;
    readonly authorizationReason?: string;
    readonly securityEventLogger?: SecurityEventLogger;
}

export type RepositoryAuthorizationHandler<TResult> = (
    context: RepositoryAuthorizationContext,
) => Promise<TResult>;

export interface SecurityEventLogInput {
    readonly orgId: string;
    readonly eventType: string;
    readonly severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly userId: string;
    readonly ipAddress?: string;
    readonly userAgent?: string;
    readonly resourceId?: string;
    readonly resourceType?: string;
    readonly metadata?: JsonRecord;
    readonly dataClassification?: DataClassificationLevel;
    readonly dataResidency?: DataResidencyZone;
    readonly piiAccessed?: boolean;
    readonly piiDetected?: boolean;
    readonly dataBreachPotential?: boolean;
    readonly remediationSteps?: string[];
    readonly auditSource?: string;
    readonly correlationId?: string;
}

export interface SecurityEventLogger {
    logSecurityEvent(input: SecurityEventLogInput): Promise<void>;
}

export interface TenantScopedRecord {
    orgId?: string | null;
}

export function hasOrgId(record: TenantScopedRecord): record is Required<TenantScopedRecord> {
    return typeof record.orgId === 'string' && record.orgId.length > 0;
}

export interface SecureTenantScopedRecord extends TenantScopedRecord {
    dataClassification: string;
    dataResidency: string;
    piiDetected?: boolean;
}
