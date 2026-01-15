import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { PrismaRoleRepository } from '@/server/repositories/prisma/org/roles/prisma-role-repository';
import { PrismaMembershipRepository } from '@/server/repositories/prisma/org/membership/prisma-membership-repository';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';
import { PrismaPermissionResourceRepository } from '@/server/repositories/prisma/org/permissions/prisma-permission-resource-repository';
import { PrismaAbsenceTypeConfigRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-type-config-repository';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { IMembershipRepository } from '@/server/repositories/contracts/org/membership/membership-repository-contract';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import type { IPermissionResourceRepository } from '@/server/repositories/contracts/org/permissions/permission-resource-repository-contract';
import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';

export interface OrganizationCreationDependencies {
    organizationRepository: IOrganizationRepository;
    roleRepository: IRoleRepository;
    membershipRepository: IMembershipRepository;
    abacPolicyRepository: IAbacPolicyRepository;
    permissionResourceRepository: IPermissionResourceRepository;
    absenceTypeConfigRepository: IAbsenceTypeConfigRepository;
}

export interface OrganizationCreationDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<OrganizationCreationDependencies>;
}

export function buildOrganizationCreationDependencies(
    options?: OrganizationCreationDependencyOptions,
): OrganizationCreationDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        organizationRepository:
            options?.overrides?.organizationRepository ?? new PrismaOrganizationRepository(repoOptions),
        roleRepository:
            options?.overrides?.roleRepository ?? new PrismaRoleRepository(repoOptions),
        membershipRepository:
            options?.overrides?.membershipRepository ?? new PrismaMembershipRepository(repoOptions),
        abacPolicyRepository:
            options?.overrides?.abacPolicyRepository ?? new PrismaAbacPolicyRepository(repoOptions),
        permissionResourceRepository:
            options?.overrides?.permissionResourceRepository ?? new PrismaPermissionResourceRepository(repoOptions),
        absenceTypeConfigRepository:
            options?.overrides?.absenceTypeConfigRepository ?? new PrismaAbsenceTypeConfigRepository(repoOptions),
    };
}
