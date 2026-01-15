import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaRoleRepository } from '@/server/repositories/prisma/org/roles';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';

export interface PermissionResolutionRepositoryDependencies {
  roleRepository: IRoleRepository;
}

export type Overrides = Partial<PermissionResolutionRepositoryDependencies>;

export interface PermissionResolutionServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildPermissionResolutionServiceDependencies(
  options?: PermissionResolutionServiceDependencyOptions,
): PermissionResolutionRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    roleRepository: options?.overrides?.roleRepository ?? new PrismaRoleRepository(repoOptions),
  };
}
