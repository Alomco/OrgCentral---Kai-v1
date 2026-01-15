import type { createAuth } from '@/server/lib/auth';
import { prisma } from '@/server/lib/prisma';
import { requireSessionAuthorization } from '@/server/security/authorization';
import {
    getMembershipRoleSnapshot,
    resolveRoleDashboard,
    resolveRoleRedirectPath,
    ROLE_DASHBOARD_PATHS,
    sanitizeNextPath,
} from '@/server/ui/auth/role-redirect';
import { getAuthOrganizationBridgeService } from '@/server/services/auth/auth-organization-bridge-service.provider';
import { MembershipStatus } from '@/server/types/prisma';

const DEFAULT_NEXT_PATH = '/dashboard';
const LOGIN_PATH = '/login';
const NOT_INVITED_PATH = '/not-invited';
const DEFAULT_MEMBERSHIP_DATE = new Date(0);

interface SafeNextPath {
    path: string;
    isExplicit: boolean;
}

interface MembershipLookupRecord {
    orgId: string;
    activatedAt: Date | null;
    invitedAt: Date | null;
}

export interface PostLoginDependencies {
    auth: ReturnType<typeof createAuth>;
}

export interface PostLoginOverrides {
    auth: PostLoginDependencies['auth'];
}

export interface PostLoginInput {
    headers: Headers;
    requestUrl: URL;
}

export interface PostLoginResult {
    redirectUrl: URL;
    setActiveHeaders?: Headers;
}

export async function handlePostLogin(
    overrides: PostLoginOverrides,
    input: PostLoginInput,
): Promise<PostLoginResult> {
    const session = await overrides.auth.api.getSession({ headers: input.headers });
    const { path: nextPath, isExplicit } = resolveSafeNextPath(input.requestUrl);

    if (!session?.session) {
        return { redirectUrl: buildLoginRedirect(input.requestUrl, nextPath) };
    }

    const desiredOrgSlug = resolveOptionalOrgSlug(input.requestUrl);
    const currentActiveOrgId = session.session.activeOrganizationId;

    let desiredOrgId: string | null = null;

    if (desiredOrgSlug) {
        const memberships = await listActiveMembershipsForUser(
            session.user.id,
            desiredOrgSlug,
        );
        desiredOrgId = selectLatestMembershipOrgId(memberships);
    }

    desiredOrgId ??= currentActiveOrgId ?? null;

    if (desiredOrgId === null) {
        const memberships = await listActiveMembershipsForUser(session.user.id);
        desiredOrgId = selectLatestMembershipOrgId(memberships);
    }

    if (desiredOrgId === null) {
        return { redirectUrl: buildNotInvitedRedirect(input.requestUrl, nextPath) };
    }

    const membershipSnapshot = await getMembershipRoleSnapshot(desiredOrgId, session.user.id);
    if (!membershipSnapshot) {
        return { redirectUrl: buildNotInvitedRedirect(input.requestUrl, nextPath) };
    }

    await requireSessionAuthorization(session, {
        orgId: desiredOrgId,
        auditSource: 'auth:post-login',
    });

    const dashboardRole = resolveRoleDashboard(membershipSnapshot);
    const redirectPath = isExplicit
        ? resolveRoleRedirectPath(dashboardRole, nextPath)
        : ROLE_DASHBOARD_PATHS[dashboardRole];

    if (currentActiveOrgId === desiredOrgId) {
        return { redirectUrl: new URL(redirectPath, input.requestUrl.origin) };
    }

    await ensureAuthOrganizationBridge(desiredOrgId, session.user.id, membershipSnapshot.roleName);

    const { headers: setActiveHeaders } = await overrides.auth.api.setActiveOrganization({
        headers: input.headers,
        body: { organizationId: desiredOrgId },
        returnHeaders: true,
    });

    return {
        redirectUrl: new URL(redirectPath, input.requestUrl.origin),
        setActiveHeaders,
    };
}

function resolveSafeNextPath(requestUrl: URL): SafeNextPath {
    const candidate = requestUrl.searchParams.get('next');
    if (typeof candidate === 'string') {
        const safeNextPath = sanitizeNextPath(candidate);
        if (safeNextPath) {
            return { path: safeNextPath, isExplicit: true };
        }
    }

    return { path: DEFAULT_NEXT_PATH, isExplicit: false };
}

function resolveOptionalOrgSlug(requestUrl: URL): string | null {
    const candidate = requestUrl.searchParams.get('org');
    if (typeof candidate !== 'string') {
        return null;
    }
    const trimmed = candidate.trim();
    return trimmed.length > 0 ? trimmed : null;
}

async function ensureAuthOrganizationBridge(
    orgId: string,
    userId: string,
    roleNameOverride: string | null,
): Promise<void> {
    const authBridgeService = getAuthOrganizationBridgeService();
    await authBridgeService.ensureAuthOrganizationBridge(orgId, userId, roleNameOverride);
}

function buildLoginRedirect(requestUrl: URL, nextPath: string): URL {
    return new URL(`${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`, requestUrl.origin);
}

function buildNotInvitedRedirect(requestUrl: URL, nextPath: string): URL {
    return new URL(`${NOT_INVITED_PATH}?next=${encodeURIComponent(nextPath)}`, requestUrl.origin);
}

async function listActiveMembershipsForUser(
    userId: string,
    orgSlug?: string,
): Promise<MembershipLookupRecord[]> {
    return prisma.membership.findMany({
        where: {
            userId,
            status: MembershipStatus.ACTIVE,
            org: orgSlug ? { slug: orgSlug } : undefined,
        },
        select: {
            orgId: true,
            activatedAt: true,
            invitedAt: true,
        },
    });
}

function selectLatestMembershipOrgId(
    memberships: MembershipLookupRecord[],
): string | null {
    if (memberships.length === 0) {
        return null;
    }

    let latest = memberships[0];
    let latestTimestamp = resolveMembershipTimestamp(latest);

    for (const membership of memberships.slice(1)) {
        const timestamp = resolveMembershipTimestamp(membership);
        if (timestamp > latestTimestamp) {
            latest = membership;
            latestTimestamp = timestamp;
        }
    }

    return latest.orgId;
}

function resolveMembershipTimestamp(membership: MembershipLookupRecord): number {
    return (membership.activatedAt ?? membership.invitedAt ?? DEFAULT_MEMBERSHIP_DATE).getTime();
}
