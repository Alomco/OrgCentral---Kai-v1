import { randomBytes, randomUUID } from 'node:crypto';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { IImpersonationRepository } from '@/server/repositories/contracts/platform/admin/impersonation-repository-contract';
import type { IPlatformTenantRepository } from '@/server/repositories/contracts/platform/admin/platform-tenant-repository-contract';
import type { ImpersonationRequest, ImpersonationSession } from '@/server/types/platform/impersonation';
import { enforcePermission } from '@/server/repositories/security';
import { parseImpersonationApprove, type ImpersonationApproveInput } from '@/server/validators/platform/admin/impersonation-validators';
import { ValidationError } from '@/server/errors';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { requireTenantInScope } from '@/server/use-cases/platform/admin/tenants/tenant-scope-guards';
import { checkAdminRateLimit, buildAdminRateLimitKey } from '@/server/lib/security/admin-rate-limit';
import { enforceImpersonationSecurity, requireTargetUserMembership } from './impersonation-guards';

export interface ApproveImpersonationInput {
    authorization: RepositoryAuthorizationContext;
    request: ImpersonationApproveInput;
}

export interface ApproveImpersonationDependencies {
    impersonationRepository: IImpersonationRepository;
    tenantRepository: IPlatformTenantRepository;
}

export async function approveImpersonationRequest(
    deps: ApproveImpersonationDependencies,
    input: ApproveImpersonationInput,
): Promise<ImpersonationSession> {
    enforcePermission(input.authorization, 'platformImpersonation', 'approve');

    const request = parseImpersonationApprove(input.request);

    const rate = checkAdminRateLimit(
        buildAdminRateLimitKey({
            orgId: input.authorization.orgId,
            userId: input.authorization.userId,
            action: 'impersonation.approve',
        }),
        10 * 60 * 1000,
        12,
    );

    if (!rate.allowed) {
        throw new ValidationError('Rate limit exceeded for impersonation approvals.');
    }

    await enforceImpersonationSecurity(input.authorization);
    const existing = await deps.impersonationRepository.getRequest(input.authorization, request.requestId);

    if (!existing) {
        throw new ValidationError('Impersonation request not found.');
    }
    const tenant = await requireTenantInScope(
        deps.tenantRepository,
        input.authorization,
        existing.targetOrgId,
        'Target tenant not found or not within allowed scope for impersonation.',
    );
    await requireTargetUserMembership(existing.targetOrgId, existing.targetUserId);
    if (existing.status !== 'PENDING') {
        throw new ValidationError('Impersonation request is not pending.');
    }
    if (existing.requestedBy === input.authorization.userId) {
        throw new ValidationError('Approver must be different from requester.');
    }

    const now = new Date();
    if (new Date(existing.expiresAt) <= now) {
        throw new ValidationError('Impersonation request has expired.');
    }

    const updatedRequest: ImpersonationRequest = {
        ...existing,
        status: 'ACTIVE',
        approvedBy: input.authorization.userId,
        approvedAt: now.toISOString(),
        updatedAt: now.toISOString(),
    };

    await deps.impersonationRepository.updateRequest(input.authorization, updatedRequest);

    const session: ImpersonationSession = {
        id: randomUUID(),
        orgId: input.authorization.orgId,
        dataResidency: tenant.dataResidency,
        dataClassification: tenant.dataClassification,
        auditSource: input.authorization.auditSource,
        requestId: updatedRequest.id,
        startedBy: input.authorization.userId,
        targetUserId: updatedRequest.targetUserId,
        targetOrgId: updatedRequest.targetOrgId,
        status: 'ACTIVE',
        sessionToken: randomBytes(24).toString('hex'),
        startedAt: now.toISOString(),
        expiresAt: updatedRequest.expiresAt,
        revokedAt: null,
    };

    try {
        await deps.impersonationRepository.createSession(input.authorization, session);
    } catch (error) {
        const rollback: ImpersonationRequest = {
            ...updatedRequest,
            status: 'PENDING',
            approvedBy: null,
            approvedAt: null,
            updatedAt: new Date().toISOString(),
        };
        await deps.impersonationRepository.updateRequest(input.authorization, rollback);
        throw error;
    }

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'AUTH',
        action: 'impersonation.approved',
        resource: 'platformImpersonationSession',
        resourceId: session.id,
        payload: {
            requestId: updatedRequest.id,
            targetUserId: session.targetUserId,
            targetOrgId: session.targetOrgId,
        },
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        auditBatchId: input.authorization.auditBatchId,
    });

    return session;
}
