import type { AuthSession } from '@/server/lib/auth';
import type { OrgPermissionMap } from '../access-control';
import type { OrgAccessInput } from '../guards';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import { AuthorizationError } from '@/server/errors';
import { appLogger } from '@/server/logging/structured-logger';
import {
    RepositoryAuthorizer,
    type RepositoryAuthorizationContext,
    type RepositoryAuthorizationHandler,
    withRepositoryAuthorization,
} from '@/server/repositories/security';
import { z } from 'zod';

const uuidSchema = z.uuid();

type SessionIdentifierField = 'userId' | 'orgId';

interface SessionIdentifierCandidate {
    source: string;
    value?: string;
}

export interface SessionAccessRequest {
    orgId?: string;
    requiredPermissions?: OrgPermissionMap;
    requiredAnyPermissions?: readonly OrgPermissionMap[];
    expectedClassification?: DataClassificationLevel;
    expectedResidency?: DataResidencyZone;
    auditSource?: string;
    correlationId?: string;
    action?: string;
    resourceType?: string;
    resourceAttributes?: Record<string, unknown>;
}

export function buildOrgAccessInputFromSession(
    session: AuthSession | null,
    request: SessionAccessRequest,
): OrgAccessInput {
    const userIdCandidate = resolveUserIdCandidate(session);
    const orgIdCandidate = resolveOrgIdCandidate(session, request.orgId);

    const userId = extractUuidIdentifier(userIdCandidate, 'userId');
    const orgId = extractUuidIdentifier(orgIdCandidate, 'orgId');

    return {
        orgId,
        userId,
        requiredPermissions: request.requiredPermissions,
        requiredAnyPermissions: request.requiredAnyPermissions,
        expectedClassification: request.expectedClassification,
        expectedResidency: request.expectedResidency,
        auditSource: request.auditSource ?? 'better-auth-session',
        correlationId: request.correlationId,
        action: request.action,
        resourceType: request.resourceType,
        resourceAttributes: request.resourceAttributes,
    };
}

export async function withSessionAuthorization<TResult>(
    session: AuthSession | null,
    request: SessionAccessRequest,
    handler: RepositoryAuthorizationHandler<TResult>,
    authorizer: RepositoryAuthorizer = RepositoryAuthorizer.default(),
): Promise<TResult> {
    const input = buildOrgAccessInputFromSession(session, request);
    return withRepositoryAuthorization(input, handler, authorizer);
}

export async function requireSessionAuthorization(
    session: AuthSession | null,
    request: SessionAccessRequest,
    authorizer: RepositoryAuthorizer = RepositoryAuthorizer.default(),
): Promise<RepositoryAuthorizationContext> {
    const input = buildOrgAccessInputFromSession(session, request);
    return authorizer.authorize(input, (context) => Promise.resolve(context));
}

function resolveUserIdCandidate(session: AuthSession | null): SessionIdentifierCandidate {
    const direct = (session as { user?: { id?: string } } | null)?.user?.id;
    if (typeof direct === 'string' && direct.length > 0) {
        return { value: direct, source: 'session.user.id' };
    }

    const sessionUserId = (session as { session?: { userId?: string } } | null)?.session?.userId;
    if (typeof sessionUserId === 'string' && sessionUserId.length > 0) {
        return { value: sessionUserId, source: 'session.session.userId' };
    }

    const nested = (session as { session?: { user?: { id?: string } } } | null)?.session?.user?.id;
    if (typeof nested === 'string' && nested.length > 0) {
        return { value: nested, source: 'session.session.user.id' };
    }

    return { source: 'missing' };
}

function resolveOrgIdCandidate(session: AuthSession | null, provided?: string): SessionIdentifierCandidate {
    if (typeof provided === 'string' && provided.length > 0) {
        return { value: provided, source: 'request.orgId' };
    }

    const activeOrgId =
        (session as { session?: { activeOrganizationId?: string } } | null)?.session?.activeOrganizationId;
    if (typeof activeOrgId === 'string' && activeOrgId.length > 0) {
        return { value: activeOrgId, source: 'session.session.activeOrganizationId' };
    }

    const fallbackOrgId =
        (session as { session?: { organizationId?: string } } | null)?.session?.organizationId;
    if (typeof fallbackOrgId === 'string' && fallbackOrgId.length > 0) {
        return { value: fallbackOrgId, source: 'session.session.organizationId' };
    }

    return { source: 'missing' };
}

function extractUuidIdentifier(
    candidate: SessionIdentifierCandidate,
    field: SessionIdentifierField,
): string {
    const raw = normalizeIdentifier(candidate.value);
    if (!raw) {
        logInvalidIdentifier(field, candidate.source, false);
        throw new AuthorizationError(
            `Authenticated session is missing a ${field}.`,
            { reason: 'unauthenticated', field, source: candidate.source },
        );
    }

    const parsed = uuidSchema.safeParse(raw);
    if (!parsed.success) {
        logInvalidIdentifier(field, candidate.source, true);
        throw new AuthorizationError(
            `Authenticated session contains an invalid ${field}.`,
            { reason: 'invalid_session_identity', field, source: candidate.source },
        );
    }

    return parsed.data;
}

function normalizeIdentifier(value: string | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function logInvalidIdentifier(field: SessionIdentifierField, source: string, hasValue: boolean): void {
    appLogger.warn('auth.session.invalid_identifier', {
        field,
        source,
        hasValue,
    });
}
