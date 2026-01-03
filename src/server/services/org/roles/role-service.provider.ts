import { PrismaRoleRepository } from '@/server/repositories/prisma/org/roles';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import { getNotificationComposerService } from '@/server/services/platform/notifications/notification-composer.provider';
import { getRoleQueueClient } from '@/server/workers/org/roles/role.queue';
import { RoleService, type RoleServiceDependencies } from './role-service';

export interface RoleServiceProviderOptions {
  prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export class RoleServiceProvider {
  private readonly prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
  private readonly defaultDependencies: RoleServiceDependencies;
  private readonly sharedService: RoleService;

  constructor(options?: RoleServiceProviderOptions) {
    this.prismaOptions = options?.prismaOptions;
    this.defaultDependencies = this.createDependencies(this.prismaOptions);
    this.sharedService = new RoleService(this.defaultDependencies);
  }

  getService(overrides?: Partial<RoleServiceDependencies>): RoleService {
    if (!overrides || Object.keys(overrides).length === 0) {
      return this.sharedService;
    }

    const deps = this.createDependencies(this.prismaOptions);

    return new RoleService({
      roleRepository: overrides.roleRepository ?? deps.roleRepository,
      notificationComposer: overrides.notificationComposer ?? deps.notificationComposer,
      roleQueue: overrides.roleQueue ?? deps.roleQueue,
    });
  }

  private createDependencies(
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>,
  ): RoleServiceDependencies {
    const prismaClient = prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions = {
      prisma: prismaClient,
      trace: prismaOptions?.trace,
      onAfterWrite: prismaOptions?.onAfterWrite,
    };

    return {
      roleRepository: new PrismaRoleRepository(repoOptions),
      notificationComposer: getNotificationComposerService(),
      roleQueue: getRoleQueueClient(),
    };
  }
}

const defaultRoleServiceProvider = new RoleServiceProvider();

export function getRoleService(
  overrides?: Partial<RoleServiceDependencies>,
  options?: RoleServiceProviderOptions,
): RoleService {
  const provider = options ? new RoleServiceProvider(options) : defaultRoleServiceProvider;
  return provider.getService(overrides);
}

export type RoleServiceContract = Pick<
  RoleService,
  'listRoles' | 'getRole' | 'createRole' | 'updateRole' | 'deleteRole'
>;
