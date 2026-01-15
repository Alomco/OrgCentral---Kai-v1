import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaOnboardingInvitationRepository } from '@/server/repositories/prisma/hr/onboarding';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IOnboardingInvitationRepository } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';

export interface PeopleOrchestrationRepositoryDependencies {
  onboardingInvitationRepository?: IOnboardingInvitationRepository;
  organizationRepository?: IOrganizationRepository;
}

export type Overrides = Partial<PeopleOrchestrationRepositoryDependencies>;

export interface PeopleOrchestrationServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildPeopleOrchestrationServiceDependencies(
  options?: PeopleOrchestrationServiceDependencyOptions,
): PeopleOrchestrationRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    onboardingInvitationRepository:
      options?.overrides?.onboardingInvitationRepository ?? new PrismaOnboardingInvitationRepository(repoOptions),
    organizationRepository:
      options?.overrides?.organizationRepository ?? new PrismaOrganizationRepository({ prisma: prismaClient }),
  };
}
