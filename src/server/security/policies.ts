import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface SessionPolicy {
    accessTokenTtlMinutes: number;
    refreshTokenTtlMinutes: number;
    rotateRefreshTokens: boolean;
    deviceBinding: boolean;
    ipPinning: boolean;
    privilegedSessionExtensionMinutes: number;
}

export interface MfaPolicy {
    enforcedRoles: string[];
    enforcedActions: string[];
    fallbackFactors: ('totp' | 'webauthn')[];
    adaptiveSignals: string[];
}

export interface SecretsPolicy {
    kmsKeyAlias: string;
    rotationCadenceDays: number;
    rejectPlaintextInSource: boolean;
}

export interface AuditPolicy {
    immutable: boolean;
    sinks: string[];
    redactSensitiveFields: string[];
}

export interface ResidencyPolicy {
    defaultZone: DataResidencyZone;
    allowCrossBorderReplication: boolean;
    contractReferenceField: string;
}

export interface SecurityPolicies {
    session: SessionPolicy;
    mfa: MfaPolicy;
    secrets: SecretsPolicy;
    audit: AuditPolicy;
    residency: ResidencyPolicy;
    dataClassificationFloor: DataClassificationLevel;
}

const defaultSecurityPolicies: SecurityPolicies = {
    session: {
        accessTokenTtlMinutes: 15,
        refreshTokenTtlMinutes: 60 * 24,
        rotateRefreshTokens: true,
        deviceBinding: true,
        ipPinning: true,
        privilegedSessionExtensionMinutes: 15,
    },
    mfa: {
        enforcedRoles: ['owner', 'orgAdmin', 'compliance'],
        enforcedActions: ['governance', 'invite', 'residency.enforce'],
        fallbackFactors: ['totp', 'webauthn'],
        adaptiveSignals: ['ipReputation', 'deviceDrift', 'unusualGeo'],
    },
    secrets: {
        kmsKeyAlias: 'orgcentral/security-default',
        rotationCadenceDays: 90,
        rejectPlaintextInSource: true,
    },
    audit: {
        immutable: true,
        sinks: ['mongo.auditLogs', 'postgres.audit_logs'],
        redactSensitiveFields: ['niNumber', 'healthData', 'diversityAttributes'],
    },
    residency: {
        defaultZone: 'UK_ONLY',
        allowCrossBorderReplication: false,
        contractReferenceField: 'residencyContractId',
    },
    dataClassificationFloor: 'OFFICIAL',
};

function mergeSection<TSection>(
    base: TSection,
    override?: Partial<TSection>,
): TSection {
    if (!override) {
        return { ...base };
    }
    return { ...base, ...override };
}

export function resolveSecurityPolicies(
    overrides?: Partial<SecurityPolicies>,
): SecurityPolicies {
    return {
        session: mergeSection(defaultSecurityPolicies.session, overrides?.session),
        mfa: mergeSection(defaultSecurityPolicies.mfa, overrides?.mfa),
        secrets: mergeSection(defaultSecurityPolicies.secrets, overrides?.secrets),
        audit: mergeSection(defaultSecurityPolicies.audit, overrides?.audit),
        residency: mergeSection(defaultSecurityPolicies.residency, overrides?.residency),
        dataClassificationFloor:
            overrides?.dataClassificationFloor ?? defaultSecurityPolicies.dataClassificationFloor,
    };
}

export function updateSecurityPolicies(
    current: SecurityPolicies,
    overrides: Partial<SecurityPolicies>,
): SecurityPolicies {
    return resolveSecurityPolicies({ ...current, ...overrides });
}

export function isPrivilegedAction(
    action: string,
    policies: SecurityPolicies = defaultSecurityPolicies,
): boolean {
    return policies.mfa.enforcedActions.some((item) => action.startsWith(item));
}

export function requiresMfaForRole(
    role: string,
    policies: SecurityPolicies = defaultSecurityPolicies,
): boolean {
    return policies.mfa.enforcedRoles.includes(role);
}

export { defaultSecurityPolicies };
