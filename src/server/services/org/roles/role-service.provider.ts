import { getNotificationComposerService } from '@/server/services/platform/notifications/notification-composer.provider';
import { getRoleQueueClient } from '@/server/workers/org/roles/role.queue';
import { RoleService, type RoleServiceDependencies } from './role-service';
import { buildRoleServiceDependencies, type RoleServiceDependencyOptions } from '@/server/repositories/providers/org/role-service-dependencies';

type ProviderPrismaOptions = RoleServiceDependencyOptions['prismaOptions'];

export interface RoleServiceProviderOptions {
  prismaOptions?: ProviderPrismaOptions;
}

export class RoleServiceProvider {
  private readonly prismaOptions?: ProviderPrismaOptions;
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

    const deps = this.createDependencies(this.prismaOptions, overrides);

    return new RoleService(deps);
  }

  private createDependencies(
    prismaOptions?: ProviderPrismaOptions,
    overrides?: Partial<RoleServiceDependencies>,
  ): RoleServiceDependencies {
    const dependencies = buildRoleServiceDependencies({
      prismaOptions: prismaOptions,
      overrides: {
        notificationComposer: getNotificationComposerService(),
        roleQueue: getRoleQueueClient(),
        ...overrides,
      }
    });

    return {
      roleRepository: dependencies.roleRepository,
      permissionResourceRepository: dependencies.permissionResourceRepository,
      notificationComposer: dependencies.notificationComposer,
      roleQueue: dependencies.roleQueue,
    };
}
}

const defaultRoleServiceProvider = new RoleServiceProvider();

export function getRoleService(
  overrides?: Partial<RoleServiceDependencies>,
  options?: RoleServiceDependencyOptions,
): RoleService {
  const provider = options ? new RoleServiceProvider({ prismaOptions: options.prismaOptions }) : defaultRoleServiceProvider;
  return provider.getService(overrides);
}

export type RoleServiceContract = Pick<
  RoleService,
  'listRoles' | 'getRole' | 'createRole' | 'updateRole' | 'deleteRole'
>;
