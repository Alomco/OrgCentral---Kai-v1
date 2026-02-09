import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { IImpersonationRepository } from '@/server/repositories/contracts/platform/admin/impersonation-repository-contract';
import type { IPlatformTenantRepository } from '@/server/repositories/contracts/platform/admin/platform-tenant-repository-contract';
import type { IAuthSessionRepository } from '@/server/repositories/contracts/auth/sessions/auth-session-repository-contract';
import type { ImpersonationSession } from '@/server/types/platform/impersonation';
import { enforcePermission } from '@/server/repositories/security';
import { parseImpersonationStart, type ImpersonationStartInput } from '@/server/validators/platform/admin/impersonation-validators';
import { ValidationError } from '@/server/errors';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { requireTenantInScope } from '@/server/use-cases/platform/admin/tenants/tenant-scope-guards';
import { checkAdminRateLimit, buildAdminRateLimitKey } from '@/server/lib/security/admin-rate-limit';
import { enforceImpersonationSecurity, requireTargetUserMembership } from './impersonation-guards';

export interface StartImpersonationInput {
    authorization: RepositoryAuthorizationContext;
    headers: Headers | HeadersInit;
    request: ImpersonationStartInput;
}

export interface StartImpersonationDependencies {
    impersonationRepository: IImpersonationRepository;
    tenantRepository: IPlatformTenantRepository;
    authSessionRepository: IAuthSessionRepository;
}

export interface StartImpersonationResult {
    session: ImpersonationSession;
    authHeaders: Headers;
}

export async function startImpersonationSession(
    deps: StartImpersonationDependencies,
    input: StartImpersonationInput,
): Promise<StartImpersonationResult> {
    enforcePermission(input.authorization, 'platformImpersonation', 'start');

    const request = parseImpersonationStart(input.request);

    const rate = checkAdminRateLimit(
        buildAdminRateLimitKey({
            orgId: input.authorization.orgId,
            userId: input.authorization.userId,
            action: 'impersonation.start',
        }),
        10 * 60 * 1000,
        12,
    );

    if (!rate.allowed) {
        throw new ValidationError('Rate limit exceeded for impersonation start.');
    }

    await enforceImpersonationSecurity(input.authorization);

    const session = await deps.impersonationRepository.getSession(input.authorization, request.sessionId);
    if (!session) {
        throw new ValidationError('Impersonation session not found.');
    }

    await requireTenantInScope(
        deps.tenantRepository,
        input.authorization,
        session.targetOrgId,
        'Target tenant not found or not within allowed scope for impersonation.',
    );
    await requireTargetUserMembership(session.targetOrgId, session.targetUserId);

    if (session.sessionToken !== request.sessionToken) {
        throw new ValidationError('Impersonation session token is invalid.');
    }
    if (session.status !== 'ACTIVE') {
        throw new ValidationError('Impersonation session is not active.');
    }

    const now = new Date();
    if (new Date(session.expiresAt) <= now) {
        const expired: ImpersonationSession = {
            ...session,
            status: 'EXPIRED',
            revokedAt: session.revokedAt ?? null,
        };
        await deps.impersonationRepository.updateSession(input.authorization, expired);
        throw new ValidationError('Impersonation session has expired.');
    }

    await deps.authSessionRepository.upsertSessionByToken({
        token: session.sessionToken,
        userId: session.targetUserId,
        expiresAt: new Date(session.expiresAt),
        activeOrganizationId: session.targetOrgId,
        ipAddress: input.authorization.ipAddress ?? null,
        userAgent: input.authorization.userAgent ?? null,
    });

    const authHeaders = new Headers();
    authHeaders.append(
        'set-cookie',
        buildAuthSessionCookie(session.sessionToken, new Date(session.expiresAt), input.headers, now),
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'AUTH',
        action: 'impersonation.started',
        resource: 'platformImpersonationSession',
        resourceId: session.id,
        payload: {
            targetUserId: session.targetUserId,
            targetOrgId: session.targetOrgId,
        },
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        auditBatchId: input.authorization.auditBatchId,
    });

    return { session, authHeaders };
}

function buildAuthSessionCookie(
    token: string,
    expiresAt: Date,
    headers: Headers | HeadersInit,
    now: Date,
): string {
    const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    const secure = isSecureRequest(headers);

    const parts = [
        `better-auth.session=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${String(maxAge)}`,
    ];

    if (secure) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function isSecureRequest(headers: Headers | HeadersInit): boolean {
    const resolved = new Headers(headers);
    const forwardedProto = resolved.get('x-forwarded-proto');
    if (forwardedProto) {
        return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https';
    }
    const origin = resolved.get('origin');
    if (origin) {
        return origin.toLowerCase().startsWith('https://');
    }
    return false;
}
