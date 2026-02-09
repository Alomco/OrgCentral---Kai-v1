import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { IImpersonationRepository } from '@/server/repositories/contracts/platform/admin/impersonation-repository-contract';
import type { IPlatformTenantRepository } from '@/server/repositories/contracts/platform/admin/platform-tenant-repository-contract';
import type { ImpersonationRequest, ImpersonationSession } from '@/server/types/platform/impersonation';
import { enforcePermission } from '@/server/repositories/security';
import { filterRecordsByTenantScope } from '@/server/use-cases/platform/admin/tenants/tenant-scope-guards';
import { recordAuditEvent } from '@/server/logging/audit-logger';

const IMPERSONATION_RETENTION_DAYS = 180;

export interface ListImpersonationInput {
    authorization: RepositoryAuthorizationContext;
}

export interface ListImpersonationDependencies {
    impersonationRepository: IImpersonationRepository;
    tenantRepository: IPlatformTenantRepository;
}

export async function listImpersonationRequests(
    deps: ListImpersonationDependencies,
    input: ListImpersonationInput,
): Promise<ImpersonationRequest[]> {
    enforcePermission(input.authorization, 'platformImpersonation', 'read');
    const now = new Date();
    const requests = await deps.impersonationRepository.listRequests(input.authorization);
    const normalized = await expireRequestsIfNeeded(
        deps.impersonationRepository,
        input.authorization,
        requests,
        now,
    );
    const retained = normalized.filter((request) => isWithinRetention(request.createdAt, now));
    const scoped = await filterRecordsByTenantScope(
        deps.tenantRepository,
        input.authorization,
        retained,
        (request) => request.targetOrgId,
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'ACCESS',
        action: 'platform.impersonation.requests.list',
        resource: 'platformImpersonationRequest',
        payload: { count: scoped.length },
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        auditBatchId: input.authorization.auditBatchId,
    });

    return scoped;
}

export async function listImpersonationSessions(
    deps: ListImpersonationDependencies,
    input: ListImpersonationInput,
): Promise<ImpersonationSession[]> {
    enforcePermission(input.authorization, 'platformImpersonation', 'read');
    const now = new Date();
    const sessions = await deps.impersonationRepository.listSessions(input.authorization);
    const normalized = await expireSessionsIfNeeded(
        deps.impersonationRepository,
        input.authorization,
        sessions,
        now,
    );
    const retained = normalized.filter((session) => isWithinRetention(session.startedAt, now));
    const scoped = await filterRecordsByTenantScope(
        deps.tenantRepository,
        input.authorization,
        retained,
        (session) => session.targetOrgId,
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'ACCESS',
        action: 'platform.impersonation.sessions.list',
        resource: 'platformImpersonationSession',
        payload: { count: scoped.length },
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        auditBatchId: input.authorization.auditBatchId,
    });

    return scoped;
}

async function expireRequestsIfNeeded(
    repository: IImpersonationRepository,
    authorization: RepositoryAuthorizationContext,
    requests: ImpersonationRequest[],
    now: Date,
): Promise<ImpersonationRequest[]> {
    const updates: ImpersonationRequest[] = [];
    const nowIso = now.toISOString();

    const normalized = requests.map((request) => {
        if (isExpired(request.expiresAt, now) && (request.status === 'PENDING' || request.status === 'ACTIVE')) {
            const next = { ...request, status: 'EXPIRED' as const, updatedAt: nowIso };
            updates.push(next);
            return next;
        }
        return request;
    });

    for (const update of updates) {
        await repository.updateRequest(authorization, update);
    }

    return normalized;
}

async function expireSessionsIfNeeded(
    repository: IImpersonationRepository,
    authorization: RepositoryAuthorizationContext,
    sessions: ImpersonationSession[],
    now: Date,
): Promise<ImpersonationSession[]> {
    const updates: ImpersonationSession[] = [];

    const normalized = sessions.map((session) => {
        if (session.status === 'ACTIVE' && isExpired(session.expiresAt, now)) {
            const next = { ...session, status: 'EXPIRED' as const, revokedAt: session.revokedAt ?? null };
            updates.push(next);
            return next;
        }
        return session;
    });

    for (const update of updates) {
        await repository.updateSession(authorization, update);
    }

    return normalized;
}

function isExpired(expiresAt: string, now: Date): boolean {
    return new Date(expiresAt) <= now;
}

function isWithinRetention(timestamp: string, now: Date): boolean {
    const retentionMs = IMPERSONATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const cutoff = new Date(now.getTime() - retentionMs);
    return new Date(timestamp) >= cutoff;
}
