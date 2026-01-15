import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import { resolveIdentityCacheScopes } from '@/server/lib/cache-tags/identity';
import { invalidateCache } from '@/server/lib/cache-tags';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations/prisma-invitation-repository';
import { PrismaMembershipRepository } from '@/server/repositories/prisma/org/membership/prisma-membership-repository';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { PrismaUserRepository } from '@/server/repositories/prisma/org/users/prisma-user-repository';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people/prisma-employee-profile-repository';
import { PrismaChecklistTemplateRepository } from '@/server/repositories/prisma/hr/onboarding/prisma-checklist-template-repository';
import { PrismaChecklistInstanceRepository } from '@/server/repositories/prisma/hr/onboarding/prisma-checklist-instance-repository';
import type { BasePrismaRepositoryOptions, PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IInvitationRepository } from '@/server/repositories/contracts/auth/invitations/invitation-repository-contract';
import type { IMembershipRepository } from '@/server/repositories/contracts/org/membership/membership-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';

export interface MembershipRepositoryDependencies {
    invitationRepository: IInvitationRepository;
    membershipRepository: IMembershipRepository;
    userRepository: IUserRepository;
    organizationRepository: IOrganizationRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    checklistTemplateRepository: IChecklistTemplateRepository;
    checklistInstanceRepository: IChecklistInstanceRepository;
}

export interface MembershipRepositoryDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<MembershipRepositoryDependencies>;
}

export function buildMembershipRepositoryDependencies(
    options?: MembershipRepositoryDependencyOptions,
): MembershipRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const organizationRepo = options?.overrides?.organizationRepository
        ?? new PrismaOrganizationRepository({ prisma: prismaClient });
    const identityInvalidator = options?.prismaOptions?.onAfterWrite ?? createIdentityInvalidator(organizationRepo);

    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: identityInvalidator,
    };

    return {
        invitationRepository:
            options?.overrides?.invitationRepository ?? new PrismaInvitationRepository(repoOptions),
        membershipRepository:
            options?.overrides?.membershipRepository ?? new PrismaMembershipRepository(repoOptions),
        userRepository: options?.overrides?.userRepository ?? new PrismaUserRepository(repoOptions),
        organizationRepository: organizationRepo,
        employeeProfileRepository:
            options?.overrides?.employeeProfileRepository ?? new PrismaEmployeeProfileRepository(repoOptions),
        checklistTemplateRepository:
            options?.overrides?.checklistTemplateRepository ?? new PrismaChecklistTemplateRepository(repoOptions),
        checklistInstanceRepository:
            options?.overrides?.checklistInstanceRepository ?? new PrismaChecklistInstanceRepository(repoOptions),
    };
}

function createIdentityInvalidator(
    organizationRepo: IOrganizationRepository,
): NonNullable<BasePrismaRepositoryOptions['onAfterWrite']> {
    return async (orgId, scopes = resolveIdentityCacheScopes()) => {
        const organization = await organizationRepo.getOrganization(orgId);
        const classification = organization?.dataClassification ?? 'OFFICIAL';
        const residency = organization?.dataResidency ?? 'UK_ONLY';
        const scopesToInvalidate = scopes.length > 0 ? scopes : resolveIdentityCacheScopes();

        await Promise.all(
            scopesToInvalidate.map((scope) =>
                invalidateCache({
                    orgId,
                    scope,
                    classification,
                    residency,
                }),
            ),
        );
    };
}
