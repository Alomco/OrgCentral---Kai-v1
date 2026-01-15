import type { PrismaClientInstance, PrismaInputJsonValue } from '@/server/types/prisma';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import { ComplianceTier, DataClassificationLevel, DataResidencyZone, MembershipStatus, OrganizationStatus, RoleScope } from '@/server/types/prisma';

export interface OrganizationUpsertInput {
    slug: string;
    name: string;
    regionCode: string;
    tenantId: string;
}

export interface RoleUpsertInput {
    orgId: string;
    roleName: string;
    description: string;
    permissions: Record<string, boolean>;
    isSystem: boolean;
    isDefault: boolean;
}

export interface UserUpsertInput {
    email: string;
    displayName: string;
}

export interface MembershipUpsertInput {
    orgId: string;
    userId: string;
    roleId: string;
    metadata: PrismaInputJsonValue;
}

export interface ColdStartPersistence {
    upsertOrganization(input: OrganizationUpsertInput): Promise<ColdStartOrganization>;
    upsertRole(input: RoleUpsertInput): Promise<ColdStartRole>;
    upsertUser(input: UserUpsertInput): Promise<ColdStartUser>;
    upsertMembership(input: MembershipUpsertInput): Promise<void>;
}

export interface ColdStartOrganization {
    id: string;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
}

export interface ColdStartRole {
    id: string;
}

export interface ColdStartUser {
    id: string;
}

class PrismaColdStartPersistence implements ColdStartPersistence {
    constructor(private readonly prisma: PrismaClientInstance) { }

    async upsertOrganization(input: OrganizationUpsertInput): Promise<ColdStartOrganization> {
        const organization = await this.prisma.organization.upsert({
            where: { slug: input.slug },
            update: {
                name: input.name,
                regionCode: input.regionCode,
                tenantId: input.tenantId,
                status: OrganizationStatus.ACTIVE,
                complianceTier: ComplianceTier.GOV_SECURE,
                dataResidency: DataResidencyZone.UK_ONLY,
                dataClassification: DataClassificationLevel.OFFICIAL,
            },
            create: {
                slug: input.slug,
                name: input.name,
                regionCode: input.regionCode,
                tenantId: input.tenantId,
                status: OrganizationStatus.ACTIVE,
                complianceTier: ComplianceTier.GOV_SECURE,
                dataResidency: DataResidencyZone.UK_ONLY,
                dataClassification: DataClassificationLevel.OFFICIAL,
            },
        });

        return {
            id: organization.id,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
        };
    }

    async upsertRole(input: RoleUpsertInput): Promise<ColdStartRole> {
        const role = await this.prisma.role.upsert({
            where: { orgId_name: { orgId: input.orgId, name: input.roleName } },
            update: {
                scope: RoleScope.GLOBAL,
                permissions: input.permissions,
                inheritsRoleIds: [],
                isSystem: input.isSystem,
                isDefault: input.isDefault,
            },
            create: {
                orgId: input.orgId,
                name: input.roleName,
                description: input.description,
                scope: RoleScope.GLOBAL,
                permissions: input.permissions,
                inheritsRoleIds: [],
                isSystem: input.isSystem,
                isDefault: input.isDefault,
            },
        });

        return { id: role.id };
    }

    async upsertUser(input: UserUpsertInput): Promise<ColdStartUser> {
        const normalizedEmail = input.email.toLowerCase();
        const user = await this.prisma.user.upsert({
            where: { email: normalizedEmail },
            update: {
                displayName: input.displayName,
                status: MembershipStatus.ACTIVE,
            },
            create: {
                email: normalizedEmail,
                displayName: input.displayName,
                status: MembershipStatus.ACTIVE,
            },
        });

        return { id: user.id };
    }

    async upsertMembership(input: MembershipUpsertInput): Promise<void> {
        const timestamp = new Date();
        await this.prisma.membership.upsert({
            where: { orgId_userId: { orgId: input.orgId, userId: input.userId } },
            update: {
                roleId: input.roleId,
                status: MembershipStatus.ACTIVE,
                metadata: input.metadata,
                activatedAt: timestamp,
                updatedBy: input.userId,
            },
            create: {
                orgId: input.orgId,
                userId: input.userId,
                roleId: input.roleId,
                status: MembershipStatus.ACTIVE,
                invitedBy: null,
                invitedAt: timestamp,
                activatedAt: timestamp,
                metadata: input.metadata,
                createdBy: input.userId,
            },
        });
    }
}

export interface ColdStartServiceDependencies {
    persistence: ColdStartPersistence;
    policyRepository: IAbacPolicyRepository;
}

export interface ColdStartDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<ColdStartServiceDependencies>;
}

export function buildColdStartServiceDependencies(
    options?: ColdStartDependencyOptions,
): ColdStartServiceDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;

    return {
        persistence: options?.overrides?.persistence ?? new PrismaColdStartPersistence(prismaClient),
        policyRepository:
            options?.overrides?.policyRepository ??
            new PrismaAbacPolicyRepository({
                prisma: prismaClient,
                trace: options?.prismaOptions?.trace,
                onAfterWrite: options?.prismaOptions?.onAfterWrite,
            }),
    };
}
