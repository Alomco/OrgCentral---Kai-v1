import { randomUUID } from 'node:crypto';
import { RoleScope } from '@/server/types/prisma';
import type {
    Prisma,
    PrismaClientInstance,
    PrismaInputJsonObject,
    PrismaInputJsonValue,
} from '@/server/types/prisma';
import type {
    IPlatformProvisioningRepository,
    PlatformAuthOrgMemberRecord,
    PlatformMembershipUpsertInput,
    PlatformOrganizationRecord,
    PlatformProvisioningConfig,
    PlatformRoleRecord,
    PlatformRoleUpsertInput,
} from '@/server/repositories/contracts/platform/platform-provisioning-repository-contract';
import { prisma as defaultPrisma } from '@/server/lib/prisma';
import { BOOTSTRAP_SEED_SOURCE } from '@/server/constants/bootstrap';
import { resolveCanonicalAuthUserId } from './prisma-platform-provisioning-repository.utils';
export class PrismaPlatformProvisioningRepository implements IPlatformProvisioningRepository {
    constructor(private readonly prisma: PrismaClientInstance = defaultPrisma) { }
    async ensureAuthUserIdIsUuid(authUserId: string, email: string): Promise<string> {
        const canonicalUserId = await resolveCanonicalAuthUserId(this.prisma, authUserId, email);
        if (canonicalUserId === authUserId) {
            return canonicalUserId;
        }
        const conflictingAuthUser = await this.prisma.authUser.findUnique({
            where: { id: canonicalUserId },
            select: { id: true },
        });
        if (conflictingAuthUser) {
            throw new Error('Cannot remap auth user id during bootstrap because the target id already exists.');
        }
        await this.prisma.authUser.update({
            where: { id: authUserId },
            data: { id: canonicalUserId },
        });
        return canonicalUserId;
    }
    async upsertPlatformOrganization(
        input: PlatformProvisioningConfig,
    ): Promise<PlatformOrganizationRecord> {
        const organization = await this.prisma.organization.upsert({
            where: { slug: input.slug },
            update: {
                name: input.name,
                regionCode: input.regionCode,
                tenantId: input.tenantId,
                status: input.status,
                complianceTier: input.complianceTier,
                dataResidency: input.dataResidency,
                dataClassification: input.dataClassification,
            },
            create: {
                slug: input.slug,
                name: input.name,
                regionCode: input.regionCode,
                tenantId: input.tenantId,
                status: input.status,
                complianceTier: input.complianceTier,
                dataResidency: input.dataResidency,
                dataClassification: input.dataClassification,
            },
            select: { id: true, slug: true, name: true, dataResidency: true, dataClassification: true },
        });
        return organization;
    }
    async upsertPlatformRole(input: PlatformRoleUpsertInput): Promise<PlatformRoleRecord> {
        const existing = await this.prisma.role.findFirst({
            where: { orgId: input.orgId, name: input.roleName },
            select: { id: true },
        });
        const permissions = input.permissions as PrismaInputJsonValue;
        if (existing) {
            const updates: Prisma.RoleUpdateInput = {
                scope: input.scope ?? RoleScope.GLOBAL,
                permissions,
                inheritsRoleIds: input.inheritsRoleIds ?? [],
                isSystem: input.isSystem ?? true,
                isDefault: input.isDefault ?? true,
            };
            if (input.description !== undefined) {
                updates.description = input.description;
            }
            await this.prisma.role.update({
                where: { id: existing.id },
                data: updates,
            });
            const updated = await this.prisma.role.findUniqueOrThrow({
                where: { id: existing.id },
                select: { id: true, name: true, scope: true },
            });
            return updated;
        }
        const created = await this.prisma.role.create({
            data: {
                orgId: input.orgId,
                name: input.roleName,
                description: input.description ?? 'Platform administrator',
                scope: input.scope ?? RoleScope.GLOBAL,
                permissions,
                inheritsRoleIds: input.inheritsRoleIds ?? [],
                isSystem: input.isSystem ?? true,
                isDefault: input.isDefault ?? true,
            },
            select: { id: true, name: true, scope: true },
        });
        return created;
    }
    async upsertPlatformMembership(input: PlatformMembershipUpsertInput): Promise<void> {
        const metadata = input.metadata as PrismaInputJsonObject;
        await this.prisma.membership.upsert({
            where: { orgId_userId: { orgId: input.orgId, userId: input.userId } },
            update: {
                roleId: input.roleId,
                status: input.status,
                metadata: {
                    ...metadata,
                    lastBootstrappedAt: input.timestamps.updatedAt.toISOString(),
                },
                activatedAt: input.timestamps.activatedAt,
                updatedBy: input.auditUserId,
            },
            create: {
                orgId: input.orgId,
                userId: input.userId,
                roleId: input.roleId,
                status: input.status,
                invitedBy: null,
                invitedAt: input.timestamps.invitedAt,
                activatedAt: input.timestamps.activatedAt,
                metadata: {
                    ...metadata,
                    bootstrappedAt: input.timestamps.activatedAt.toISOString(),
                },
                createdBy: input.auditUserId,
            },
        });
    }
    async ensurePlatformAuthOrganization(
        input: PlatformProvisioningConfig,
        organization: PlatformOrganizationRecord,
    ): Promise<void> {
        const authOrgBySlug = await this.prisma.authOrganization.findUnique({
            where: { slug: input.slug },
            select: { id: true },
        });
        const authOrgById = await this.prisma.authOrganization.findUnique({
            where: { id: organization.id },
            select: { id: true },
        });
        if (authOrgBySlug && authOrgBySlug.id !== organization.id) {
            if (authOrgById) {
                throw new Error(
                    'Multiple auth organizations conflict with the platform slug/id. Delete stale auth org records and retry.',
                );
            }
            await this.prisma.authOrganization.update({
                where: { id: authOrgBySlug.id },
                data: {
                    id: organization.id,
                    name: organization.name,
                    slug: organization.slug,
                },
            });
            await this.prisma.authSession.updateMany({
                where: { activeOrganizationId: authOrgBySlug.id },
                data: { activeOrganizationId: organization.id },
            });
            return;
        }
        await this.prisma.authOrganization.upsert({
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
    async findAuthOrgMember(orgId: string, userId: string): Promise<PlatformAuthOrgMemberRecord | null> {
        const member = await this.prisma.authOrgMember.findFirst({
            where: { organizationId: orgId, userId },
            select: { id: true, organizationId: true, userId: true, role: true },
        });
        return member ?? null;
    }
    async updateAuthOrgMemberRole(id: string, role: string): Promise<void> {
        await this.prisma.authOrgMember.update({
            where: { id },
            data: { role },
        });
    }
    async createAuthOrgMember(input: { organizationId: string; userId: string; role: string }): Promise<void> {
        await this.prisma.authOrgMember.create({
            data: {
                id: randomUUID(),
                organizationId: input.organizationId,
                userId: input.userId,
                role: input.role,
            },
        });
    }
    async listUserOrganizations(userId: string, limit = 15): Promise<PlatformOrganizationRecord[]> {
        const memberships = await this.prisma.authOrgMember.findMany({
            where: { userId },
            select: { organizationId: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        const orderedOrgIds = Array.from(new Set(memberships.map((row) => row.organizationId)));
        if (orderedOrgIds.length === 0) {
            return [];
        }
        const organizations = await this.prisma.organization.findMany({
            where: { id: { in: orderedOrgIds } },
            select: { id: true, slug: true, name: true, dataResidency: true, dataClassification: true },
        });
        const organizationsById = new Map(organizations.map((org) => [org.id, org] as const));
        return orderedOrgIds
            .map((orgId) => organizationsById.get(orgId))
            .filter((org): org is PlatformOrganizationRecord => Boolean(org?.id && org.slug && org.name));
    }
}
