import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaRoleRepository } from '@/server/repositories/prisma/org/roles';
import { PrismaPermissionResourceRepository } from '@/server/repositories/prisma/org/permissions/prisma-permission-resource-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { IPermissionResourceRepository } from '@/server/repositories/contracts/org/permissions/permission-resource-repository-contract';
import type { NotificationComposerContract } from '@/server/repositories/contracts/notifications/notification-composer-contract';
import type { RoleQueueContract } from '@/server/repositories/contracts/org/roles/role-queue-contract';

export interface RoleRepositoryDependencies {
  roleRepository: IRoleRepository;
  permissionResourceRepository: IPermissionResourceRepository;
  notificationComposer?: NotificationComposerContract;
  roleQueue?: RoleQueueContract;
}

export type Overrides = Partial<RoleRepositoryDependencies>;

export interface RoleServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildRoleServiceDependencies(
  options?: RoleServiceDependencyOptions,
): RoleRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    roleRepository: options?.overrides?.roleRepository ?? new PrismaRoleRepository(repoOptions),
    permissionResourceRepository:
      options?.overrides?.permissionResourceRepository ?? new PrismaPermissionResourceRepository(repoOptions),
    notificationComposer: options?.overrides?.notificationComposer,
    roleQueue: options?.overrides?.roleQueue,
  };
}
