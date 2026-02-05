import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { ChecklistItemProgress, ChecklistTemplateItem } from '@/server/types/onboarding-types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export function mapTemplateItemsToProgress(items: ChecklistTemplateItem[]): ChecklistItemProgress[] {
    return items
        .slice()
        .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
        .map((item) => ({
            task: item.label,
            completed: false,
            completedAt: null,
            notes: item.description ?? null,
        }));
}

export async function recordOffboardingCompletedAudit(params: {
    authorization: RepositoryAuthorizationContext;
    offboardingId: string;
    profileId: string;
    mode: string;
    reason: string;
    revokedSessions: boolean;
    membershipSuspended: boolean;
}): Promise<void> {
    await recordAuditEvent({
        orgId: params.authorization.orgId,
        userId: params.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: 'hr.offboarding.completed',
        resource: 'hr.offboarding',
        resourceId: params.offboardingId,
        residencyZone: params.authorization.dataResidency,
        classification: params.authorization.dataClassification,
        auditSource: params.authorization.auditSource,
        payload: {
            profileId: params.profileId,
            mode: params.mode,
            reason: params.reason,
            revokedSessions: params.revokedSessions,
            membershipSuspended: params.membershipSuspended,
        },
    });
}

export async function recordOffboardingStartedAudit(params: {
    authorization: RepositoryAuthorizationContext;
    offboardingId: string;
    profileId: string;
    mode: string;
    checklistInstanceId: string | null;
    reason: string;
}): Promise<void> {
    await recordAuditEvent({
        orgId: params.authorization.orgId,
        userId: params.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: 'hr.offboarding.started',
        resource: 'hr.offboarding',
        resourceId: params.offboardingId,
        residencyZone: params.authorization.dataResidency,
        classification: params.authorization.dataClassification,
        auditSource: params.authorization.auditSource,
        payload: {
            profileId: params.profileId,
            mode: params.mode,
            checklistInstanceId: params.checklistInstanceId,
            reason: params.reason,
        },
    });
}
