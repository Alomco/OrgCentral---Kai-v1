import { RoleScope } from '@prisma/client';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { AbstractOrgService } from '@/server/services/org/abstract-org-service';
import type { Role } from '@/server/types/hr-types';
import {
  createRole as createRoleUseCase,
  type CreateRoleInput,
} from '@/server/use-cases/org/roles/create-role';
import {
  updateRole as updateRoleUseCase,
  type UpdateRoleInput,
} from '@/server/use-cases/org/roles/update-role';
import {
  deleteRole as deleteRoleUseCase,
  type DeleteRoleInput,
} from '@/server/use-cases/org/roles/delete-role';
import {
  listRoles as listRolesUseCase,
  type ListRolesInput,
} from '@/server/use-cases/org/roles/list-roles';
import { getRole as getRoleUseCase, type GetRoleInput } from '@/server/use-cases/org/roles/get-role';
import type { NotificationComposerContract } from '@/server/services/platform/notifications/notification-composer.provider';
import type { RoleQueueClient } from '@/server/workers/org/roles/role.queue';

type RoleChangeKind = 'created' | 'updated' | 'deleted';

const ROLE_RESOURCE_TYPE = 'org.role';
const ROLE_ADMIN_PERMISSIONS: Record<string, string[]> = { organization: ['update'] };

export interface RoleServiceDependencies {
  roleRepository: IRoleRepository;
  notificationComposer?: NotificationComposerContract;
  roleQueue?: RoleQueueClient;
}

export class RoleService extends AbstractOrgService {
  constructor(private readonly dependencies: RoleServiceDependencies) {
    super();
  }

  async listRoles(input: ListRolesInput): Promise<Role[]> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: ROLE_ADMIN_PERMISSIONS,
      action: 'org.role.list',
      resourceType: ROLE_RESOURCE_TYPE,
    });
    const context = this.buildContext(input.authorization);
    return this.executeInServiceContext(context, 'roles.list', () =>
      listRolesUseCase({ roleRepository: this.dependencies.roleRepository }, input),
    );
  }

  async getRole(input: GetRoleInput): Promise<Role> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: ROLE_ADMIN_PERMISSIONS,
      action: 'org.role.get',
      resourceType: ROLE_RESOURCE_TYPE,
      resourceAttributes: { roleId: input.roleId },
    });
    const context = this.buildContext(input.authorization, { metadata: { roleId: input.roleId } });
    return this.executeInServiceContext(context, 'roles.get', () =>
      getRoleUseCase({ roleRepository: this.dependencies.roleRepository }, input),
    );
  }

  async createRole(input: CreateRoleInput): Promise<Role> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: ROLE_ADMIN_PERMISSIONS,
      action: 'org.role.create',
      resourceType: ROLE_RESOURCE_TYPE,
      resourceAttributes: { roleName: input.name },
    });
    const context = this.buildContext(input.authorization, { metadata: { roleName: input.name } });

    const role = await this.executeInServiceContext(context, 'roles.create', () =>
      createRoleUseCase({ roleRepository: this.dependencies.roleRepository }, input),
    );

    await this.notify(input.authorization, role, 'created');
    this.enqueueWorker(input.authorization, role, 'created');
    return role;
  }

  async updateRole(input: UpdateRoleInput): Promise<Role> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: ROLE_ADMIN_PERMISSIONS,
      action: 'org.role.update',
      resourceType: ROLE_RESOURCE_TYPE,
      resourceAttributes: {
        roleId: input.roleId,
        updateKeys: Object.keys(input).filter((key) => key !== 'authorization'),
      },
    });
    const context = this.buildContext(input.authorization, { metadata: { roleId: input.roleId } });

    const role = await this.executeInServiceContext(context, 'roles.update', () =>
      updateRoleUseCase({ roleRepository: this.dependencies.roleRepository }, input),
    );

    await this.notify(input.authorization, role, 'updated');
    this.enqueueWorker(input.authorization, role, 'updated');
    return role;
  }

  async deleteRole(input: DeleteRoleInput): Promise<void> {
    await this.ensureOrgAccess(input.authorization, {
      requiredPermissions: ROLE_ADMIN_PERMISSIONS,
      action: 'org.role.delete',
      resourceType: ROLE_RESOURCE_TYPE,
      resourceAttributes: { roleId: input.roleId },
    });
    const context = this.buildContext(input.authorization, { metadata: { roleId: input.roleId } });

    const result = await this.executeInServiceContext(context, 'roles.delete', () =>
      deleteRoleUseCase({ roleRepository: this.dependencies.roleRepository }, input),
    );

    this.enqueueWorker(input.authorization, { id: result.roleId, name: result.roleName } as Role, 'deleted');

    await this.notify(input.authorization, {
      id: result.roleId,
      orgId: input.authorization.orgId,
      name: result.roleName,
      description: null,
      scope: RoleScope.ORG,
      permissions: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }, 'deleted');
  }

  private async notify(
    authorization: RepositoryAuthorizationContext,
    role: Role,
    kind: RoleChangeKind,
  ): Promise<void> {
    const composer = this.dependencies.notificationComposer;
    if (!composer) {
      return;
    }

    const title = `Role ${kind}`;
    const body = `Role "${role.name}" was ${kind}.`;

    await composer.composeAndSend({
      authorization,
      notification: {
        userId: authorization.userId,
        title,
        body,
        topic: 'system-announcement',
        priority: 'medium',
      },
      abac: {
        action: 'notification.compose',
        resourceType: 'notification',
        resourceAttributes: { targetUserId: authorization.userId },
      },
    });
  }

  private enqueueWorker(
    authorization: RepositoryAuthorizationContext,
    role: Role,
    action: RoleChangeKind,
  ) {
    if (!this.dependencies.roleQueue) {return;}

    // Fire and forget
    this.dependencies.roleQueue.enqueueRoleUpdate({
      orgId: authorization.orgId,
      authorization,
      payload: {
        roleId: role.id,
        roleName: role.name,
        action,
      },
    }).catch((error) => {
      // Log error but don't fail the request
      console.error('Failed to enqueue role update worker', error);
    });
  }
}
