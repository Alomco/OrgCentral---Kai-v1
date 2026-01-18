import { prisma } from '@/server/lib/prisma';
import { resolveRoleTemplate } from '@/server/security/role-templates';
import { RoleScope, MembershipStatus } from '@/server/types/prisma';
import type { GuardMembershipRecord } from '@/server/repositories/contracts/security/guard-membership-repository-contract';

const PLATFORM_ORGANIZATION_SLUG = process.env.PLATFORM_ORG_SLUG ?? 'orgcentral-platform';
const DEVELOPMENT_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL?.toLowerCase() ?? null;
const GLOBAL_ADMIN_EMAIL = process.env.GLOBAL_ADMIN_EMAIL?.toLowerCase() ?? null;
const DEVELOPMENT_OVERRIDE_ENABLED = process.env.NODE_ENV === 'development'
    ? true
    : (process.env.ENABLE_DEV_ADMIN_BYPASS ?? 'false') === 'true';

export async function resolveDevelopmentAdminMembershipOverride(
    orgId: string,
    userId: string,
): Promise<GuardMembershipRecord | null> {
    if (!DEVELOPMENT_OVERRIDE_ENABLED) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });

    if (!user?.email) {
        return null;
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    const isKnownDevelopmentAdmin = [DEVELOPMENT_ADMIN_EMAIL, GLOBAL_ADMIN_EMAIL]
        .filter((email): email is string => Boolean(email))
        .some((email) => normalizedEmail === email);

    const platformMembership = await prisma.membership.findFirst({
        where: {
            userId,
            status: MembershipStatus.ACTIVE,
            org: { slug: PLATFORM_ORGANIZATION_SLUG },
            role: { name: 'globalAdmin', scope: RoleScope.GLOBAL },
        },
        select: { orgId: true },
    });

    if (!platformMembership && !isKnownDevelopmentAdmin) {
        return null;
    }

    const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        select: {
            id: true,
            name: true,
            dataResidency: true,
            dataClassification: true,
        },
    });

    if (!organization) {
        return null;
    }

    const permissions = resolveRoleTemplate('globalAdmin').permissions;

    return {
        orgId: organization.id,
        userId,
        status: MembershipStatus.ACTIVE,
        roleId: null,
        roleName: 'globalAdmin',
        roleScope: RoleScope.GLOBAL,
        rolePermissions: permissions,
        departmentId: null,
        metadata: {
            devAdminOverride: true,
            source: 'dev-guard',
            platformOrgId: platformMembership?.orgId ?? null,
        },
        organization: {
            id: organization.id,
            name: organization.name,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
        },
    };
}
