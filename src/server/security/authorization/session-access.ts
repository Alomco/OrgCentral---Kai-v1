import type { AuthSession } from '@/server/lib/auth';
import type { OrgPermissionMap } from '../access-control';
import type { OrgAccessInput } from '../guards';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import {
    RepositoryAuthorizer,
    type RepositoryAuthorizationContext,
    type RepositoryAuthorizationHandler,
    withRepositoryAuthorization,
} from '@/server/repositories/security';

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
    const userId = extractUserId(session);
    const orgId = extractOrgId(session, request.orgId);

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

function extractUserId(session: AuthSession | null): string {
    const userId =
        (session as { user?: { id?: string } } | null)?.user?.id ??
        (session as { session?: { user?: { id?: string } } } | null)?.session?.user?.id;

    if (!userId) {
        throw new Error('Better Auth session is missing a user id.');
    }

    return userId;
}

function extractOrgId(session: AuthSession | null, provided?: string): string {
    const orgId =
        provided ??
        (session as { session?: { activeOrganizationId?: string; organizationId?: string } } | null)
            ?.session?.activeOrganizationId ??
        (session as { session?: { activeOrganizationId?: string; organizationId?: string } } | null)
            ?.session?.organizationId;

    if (!orgId) {
        throw new Error('Organization id was not provided and is not available on the session.');
    }

    return orgId;
}
