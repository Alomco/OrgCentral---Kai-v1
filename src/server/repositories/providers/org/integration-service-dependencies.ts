import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IIntegrationConfigRepository } from '@/server/repositories/contracts/org/integrations/integration-config-repository-contract';
import { PrismaIntegrationConfigRepository } from '@/server/repositories/prisma/org/integrations/prisma-integration-config-repository';

export interface IntegrationRepositoryDependencies {
  integrationConfigRepository: IIntegrationConfigRepository;
}

export type Overrides = Partial<IntegrationRepositoryDependencies>;

export interface IntegrationServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildIntegrationServiceDependencies(
  options?: IntegrationServiceDependencyOptions,
): IntegrationRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    integrationConfigRepository:
      options?.overrides?.integrationConfigRepository ?? new PrismaIntegrationConfigRepository(repoOptions),
  };
}
