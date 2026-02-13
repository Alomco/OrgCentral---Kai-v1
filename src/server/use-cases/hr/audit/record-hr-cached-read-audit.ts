import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HrAction } from '@/server/security/authorization/hr-permissions/actions';
import type { HrResourceType } from '@/server/security/authorization/hr-permissions/resources';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export type HrCachedReadOutcome = 'ALLOW' | 'DENY';

export interface HrCachedReadCacheMetadata {
    eligible: boolean;
    mode: 'cache' | 'no-store';
    life?: string;
    scopes?: string[];
    classification: DataClassificationLevel;
    residency: DataResidencyZone;
}

export interface HrCachedReadAuditInput {
    authorization: RepositoryAuthorizationContext;
    action: HrAction;
    resource: HrResourceType;
    resourceId?: string;
    outcome?: HrCachedReadOutcome;
    cache?: HrCachedReadCacheMetadata;
    payload?: Record<string, unknown>;
}

export async function recordHrCachedReadAudit(
    input: HrCachedReadAuditInput,
): Promise<void> {
    const { authorization } = input;

    await recordAuditEvent({
        orgId: authorization.orgId,
        userId: authorization.userId,
        eventType: 'ACCESS',
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        residencyZone: authorization.dataResidency,
        classification: authorization.dataClassification,
        auditSource: authorization.auditSource,
        correlationId: authorization.correlationId,
        payload: {
            ...input.payload,
            outcome: input.outcome ?? 'ALLOW',
            cache: input.cache,
            ipAddress: authorization.ipAddress ?? null,
            userAgent: authorization.userAgent ?? null,
        },
    });
}
