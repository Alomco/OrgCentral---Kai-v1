import type { AuthSession } from '@/server/lib/auth';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgBranding } from '@/server/types/branding-types';
import type { AppSessionSnapshot, AppUserSnapshot, OrgBrandingSnapshot } from '@/types/app-context';

function resolveUserId(session: NonNullable<AuthSession>): string | undefined {
    const direct = session.user.id;
    if (typeof direct === 'string' && direct.length) {
        return direct;
    }

    const fallback = session.session.userId;
    if (typeof fallback === 'string' && fallback.length) {
        return fallback;
    }

    return undefined;
}

export function buildAppUserSnapshot(session: NonNullable<AuthSession>): AppUserSnapshot {
    const resolvedId = resolveUserId(session);
    if (!resolvedId) {
        throw new Error('Unable to resolve authenticated user id for snapshot.');
    }

    const email = typeof session.user.email === 'string' ? session.user.email : undefined;

    return {
        id: resolvedId,
        email,
        name: typeof session.user.name === 'string' ? session.user.name : null,
        image: typeof session.user.image === 'string' ? session.user.image : null,
    };
}

export function buildAppSessionSnapshot(
    session: NonNullable<AuthSession>,
    authorization: RepositoryAuthorizationContext,
): AppSessionSnapshot {
    return {
        user: buildAppUserSnapshot(session),
        orgId: authorization.orgId,
        roleKey: authorization.roleKey,
        dataResidency: authorization.dataResidency,
        dataClassification: authorization.dataClassification,
    };
}

export function buildOrgBrandingSnapshot(branding: OrgBranding | null): OrgBrandingSnapshot | null {
    if (!branding) {
        return null;
    }

    return {
        logoUrl: branding.logoUrl ?? null,
        primaryColor: branding.primaryColor ?? null,
        secondaryColor: branding.secondaryColor ?? null,
        accentColor: branding.accentColor ?? null,
        companyName: branding.companyName ?? null,
        faviconUrl: branding.faviconUrl ?? null,
        customCss: branding.customCss ?? null,
    };
}
