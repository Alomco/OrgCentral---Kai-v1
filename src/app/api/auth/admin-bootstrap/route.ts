import { randomUUID, timingSafeEqual } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import {
    ComplianceTier,
    DataClassificationLevel,
    DataResidencyZone,
    MembershipStatus,
    OrganizationStatus,
    RoleScope,
} from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { AuthorizationError, ValidationError } from '@/server/errors';
import { createAuth } from '@/server/lib/auth';
import { syncBetterAuthUserToPrisma } from '@/server/lib/auth-sync';
import { prisma } from '@/server/lib/prisma';
import { orgRoles, type OrgRoleKey } from '@/server/security/access-control';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { appendSetCookieHeaders } from '@/server/api-adapters/http/set-cookie-headers';

const requestSchema = z.object({
    token: z.string().min(1),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_PLATFORM_ORG_SLUG = 'orgcentral-platform';
const DEFAULT_PLATFORM_ORG_NAME = 'OrgCentral Platform';
const DEFAULT_PLATFORM_TENANT_ID = 'orgcentral-platform';
const DEFAULT_PLATFORM_REGION_CODE = 'UK-LON';
const DEFAULT_GLOBAL_ADMIN_ROLE: OrgRoleKey = 'owner';
const BOOTSTRAP_SEED_SOURCE = 'api/auth/admin-bootstrap';

interface PlatformBootstrapConfig {
    platformOrgSlug: string;
    platformOrgName: string;
    platformTenantId: string;
    platformRegionCode: string;
    roleName: OrgRoleKey;
}

function resolvePlatformConfig(): PlatformBootstrapConfig {
    const roleCandidate = process.env.GLOBAL_ADMIN_ROLE_NAME ?? DEFAULT_GLOBAL_ADMIN_ROLE;

    if (!(roleCandidate in orgRoles)) {
        throw new ValidationError('GLOBAL_ADMIN_ROLE_NAME must be one of: owner, orgAdmin, compliance, member.');
    }

    return {
        platformOrgSlug: process.env.PLATFORM_ORG_SLUG ?? DEFAULT_PLATFORM_ORG_SLUG,
        platformOrgName: process.env.PLATFORM_ORG_NAME ?? DEFAULT_PLATFORM_ORG_NAME,
        platformTenantId: process.env.PLATFORM_TENANT_ID ?? DEFAULT_PLATFORM_TENANT_ID,
        platformRegionCode: process.env.PLATFORM_ORG_REGION ?? DEFAULT_PLATFORM_REGION_CODE,
        roleName: roleCandidate as OrgRoleKey,
    };
}

function isBootstrapEnabled(): boolean {
    return process.env.ENABLE_ADMIN_BOOTSTRAP === 'true';
}

function requireBootstrapSecret(): string {
    const secret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (typeof secret !== 'string' || secret.trim().length === 0) {
        throw new AuthorizationError('Admin bootstrap is disabled.');
    }
    return secret;
}

function constantTimeEquals(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    if (aBuffer.length !== bBuffer.length) {
        return false;
    }
    return timingSafeEqual(aBuffer, bBuffer);
}

function isUuid(value: string): boolean {
    return UUID_REGEX.test(value);
}

function assertUuid(value: string, name: string): void {
    if (!isUuid(value)) {
        throw new ValidationError(`${name} must be a UUID. Configure Better Auth to generate UUID ids.`);
    }
}

async function resolveCanonicalAuthUserId(authUserId: string, email: string): Promise<string> {
    if (isUuid(authUserId)) {
        return authUserId;
    }

    const existingTenantUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existingTenantUser?.id) {
        return existingTenantUser.id;
    }

    return randomUUID();
}

async function ensureAuthUserIdIsUuid(authUserId: string, email: string): Promise<string> {
    const canonicalUserId = await resolveCanonicalAuthUserId(authUserId, email);

    if (canonicalUserId === authUserId) {
        return canonicalUserId;
    }

    if (!isUuid(canonicalUserId)) {
        throw new ValidationError('Failed to resolve a UUID user id for bootstrap.');
    }

    const conflictingAuthUser = await prisma.authUser.findUnique({
        where: { id: canonicalUserId },
        select: { id: true },
    });

    if (conflictingAuthUser) {
        throw new ValidationError(
            'Cannot remap auth user id during bootstrap because the target id already exists.',
        );
    }

    await prisma.authUser.update({
        where: { id: authUserId },
        data: { id: canonicalUserId },
    });

    return canonicalUserId;
}

async function ensurePlatformAuthOrganization(
    input: PlatformBootstrapConfig,
    organization: { id: string; slug: string; name: string },
): Promise<void> {
    const authOrgBySlug = await prisma.authOrganization.findUnique({
        where: { slug: input.platformOrgSlug },
        select: { id: true },
    });

    const authOrgById = await prisma.authOrganization.findUnique({
        where: { id: organization.id },
        select: { id: true },
    });

    if (authOrgBySlug && authOrgBySlug.id !== organization.id) {
        if (authOrgById) {
            throw new ValidationError(
                'Multiple auth organizations conflict with the platform slug/id. Delete stale auth org records and retry.',
            );
        }

        await prisma.authOrganization.update({
            where: { id: authOrgBySlug.id },
            data: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
            },
        });

        await prisma.authSession.updateMany({
            where: { activeOrganizationId: authOrgBySlug.id },
            data: { activeOrganizationId: organization.id },
        });

        return;
    }

    await prisma.authOrganization.upsert({
        where: { id: organization.id },
        update: {
            name: organization.name,
            slug: organization.slug,
        },
        create: {
            id: organization.id,
            slug: organization.slug,
            name: organization.name,
            metadata: JSON.stringify({
                seedSource: BOOTSTRAP_SEED_SOURCE,
            }),
        },
    });
}

export async function POST(request: NextRequest): Promise<Response> {
    try {
        if (!isBootstrapEnabled()) {
            throw new AuthorizationError('Admin bootstrap is disabled.');
        }

        const payload = requestSchema.parse(await request.json());
        const expectedSecret = requireBootstrapSecret();
        if (!constantTimeEquals(payload.token, expectedSecret)) {
            throw new AuthorizationError('Invalid bootstrap secret.');
        }

        const auth = createAuth(request.nextUrl.origin);
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.session) {
            throw new AuthorizationError('Unauthenticated request.');
        }

        const userEmail = session.user.email;
        const userName = session.user.name;
        const providerId = 'oauth';

        if (typeof userEmail !== 'string' || userEmail.trim().length === 0) {
            throw new ValidationError('Authenticated user is missing an email address.');
        }

        const normalizedEmail = userEmail.trim().toLowerCase();
        const userId = await ensureAuthUserIdIsUuid(session.user.id, normalizedEmail);
        assertUuid(userId, 'User id');

        await syncBetterAuthUserToPrisma({
            id: userId,
            email: normalizedEmail,
            name: typeof userName === 'string' ? userName : null,
            emailVerified: true,
            lastSignInAt: new Date(),
            updatedAt: new Date(),
        });

        const config = resolvePlatformConfig();
        const developmentSuperAdmin = process.env.NODE_ENV === 'development' && config.roleName === 'owner';
        const superAdminMetadata: Prisma.InputJsonObject = {
            seedSource: BOOTSTRAP_SEED_SOURCE,
            roles: [config.roleName],
            superAdmin: true,
            bootstrapProvider: providerId,
            ...(developmentSuperAdmin ? { devSuperAdmin: true } : {}),
        };

        const organization = await prisma.organization.upsert({
            where: { slug: config.platformOrgSlug },
            update: {
                name: config.platformOrgName,
                regionCode: config.platformRegionCode,
                tenantId: config.platformTenantId,
                status: OrganizationStatus.ACTIVE,
                complianceTier: ComplianceTier.GOV_SECURE,
                dataResidency: DataResidencyZone.UK_ONLY,
                dataClassification: DataClassificationLevel.OFFICIAL,
            },
            create: {
                slug: config.platformOrgSlug,
                name: config.platformOrgName,
                regionCode: config.platformRegionCode,
                tenantId: config.platformTenantId,
                status: OrganizationStatus.ACTIVE,
                complianceTier: ComplianceTier.GOV_SECURE,
                dataResidency: DataResidencyZone.UK_ONLY,
                dataClassification: DataClassificationLevel.OFFICIAL,
            },
            select: { id: true, slug: true, name: true },
        });

        assertUuid(organization.id, 'Organization id');

        const permissions = orgRoles[config.roleName].statements as Record<string, string[]>;

        const role = await prisma.role.upsert({
            where: { orgId_name: { orgId: organization.id, name: config.roleName } },
            update: {
                scope: RoleScope.GLOBAL,
                permissions: permissions as Prisma.InputJsonValue,
            },
            create: {
                orgId: organization.id,
                name: config.roleName,
                description: 'Platform administrator',
                scope: RoleScope.GLOBAL,
                permissions: permissions as Prisma.InputJsonValue,
            },
            select: { id: true, name: true },
        });

        const timestamp = new Date();

        await prisma.membership.upsert({
            where: { orgId_userId: { orgId: organization.id, userId } },
            update: {
                roleId: role.id,
                status: MembershipStatus.ACTIVE,
                metadata: {
                    ...superAdminMetadata,
                    lastBootstrappedAt: timestamp.toISOString(),
                },
                activatedAt: timestamp,
                updatedBy: userId,
            },
            create: {
                orgId: organization.id,
                userId,
                roleId: role.id,
                status: MembershipStatus.ACTIVE,
                invitedBy: null,
                invitedAt: timestamp,
                activatedAt: timestamp,
                metadata: {
                    ...superAdminMetadata,
                    bootstrappedAt: timestamp.toISOString(),
                },
                createdBy: userId,
            },
        });

        await ensurePlatformAuthOrganization(config, organization);

        const existingMember = await prisma.authOrgMember.findFirst({
            where: { organizationId: organization.id, userId },
            select: { id: true },
        });

        if (existingMember) {
            await prisma.authOrgMember.update({
                where: { id: existingMember.id },
                data: { role: config.roleName },
            });
        } else {
            await prisma.authOrgMember.create({
                data: {
                    id: randomUUID(),
                    organizationId: organization.id,
                    userId,
                    role: config.roleName,
                },
            });
        }

        const { headers: setActiveHeaders } = await auth.api.setActiveOrganization({
            headers: request.headers,
            body: { organizationId: organization.id },
            returnHeaders: true,
        });

        const response = NextResponse.json({
            ok: true,
            orgId: organization.id,
            role: config.roleName,
            redirectTo: '/dashboard',
        });

        appendSetCookieHeaders(setActiveHeaders, response.headers);
        return response;
    } catch (error) {
        return buildErrorResponse(error);
    }
}
