import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaPermissionResourceRepository } from '@/server/repositories/prisma/org/permissions/prisma-permission-resource-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IPermissionResourceRepository } from '@/server/repositories/contracts/org/permissions/permission-resource-repository-contract';

export interface PermissionResourceRepositoryDependencies {
  permissionRepository: IPermissionResourceRepository;
}

export type Overrides = Partial<PermissionResourceRepositoryDependencies>;

export interface PermissionResourceServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildPermissionResourceServiceDependencies(
  options?: PermissionResourceServiceDependencyOptions,
): PermissionResourceRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    permissionRepository: 
      options?.overrides?.permissionRepository ?? new PrismaPermissionResourceRepository(repoOptions),
  };
}
