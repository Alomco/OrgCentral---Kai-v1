import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@/server/errors';
import { CACHE_SCOPE_ROLES } from '@/server/repositories/cache-scopes';
import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { RoleScope } from '@/server/types/prisma';
import type { Role } from '@/server/types/hr-types';
import type { PermissionResource } from '@/server/types/security-types';
import { createRole } from '@/server/use-cases/org/roles/create-role';
import { updateRole } from '@/server/use-cases/org/roles/update-role';

const { invalidateOrgCacheMock } = vi.hoisted(() => ({
  invalidateOrgCacheMock: vi.fn(async () => undefined),
}));

vi.mock('@/server/lib/cache-tags', () => ({
  invalidateOrgCache: invalidateOrgCacheMock,
}));

class InMemoryRoleRepository implements IRoleRepository {
  private readonly rolesById = new Map<string, Role>();

  constructor(seed: Role[] = []) {
    for (const role of seed) {
      this.rolesById.set(role.id, role);
    }
  }

  async createRole(_tenantId: string, role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const created: Role = { ...role, id: `role-${this.rolesById.size + 1}`, createdAt: now, updatedAt: now };
    this.rolesById.set(created.id, created);
  }

  async updateRole(_tenantId: string, roleId: string, updates: Partial<Omit<Role, 'id' | 'orgId' | 'createdAt'>>): Promise<void> {
    const existing = this.rolesById.get(roleId);
    if (!existing) {
      return;
    }
    this.rolesById.set(roleId, { ...existing, ...updates, updatedAt: new Date('2026-01-02T00:00:00.000Z') });
  }

  async getRole(_tenantId: string, roleId: string): Promise<Role | null> {
    return this.rolesById.get(roleId) ?? null;
  }

  async getRoleByName(tenantId: string, roleName: string): Promise<Role | null> {
    for (const role of this.rolesById.values()) {
      if (role.orgId === tenantId && role.name === roleName) {
        return role;
      }
    }
    return null;
  }

  async getRolesByOrganization(tenantId: string): Promise<Role[]> {
    return Array.from(this.rolesById.values()).filter((role) => role.orgId === tenantId);
  }

  async getRolesByIds(tenantId: string, roleIds: string[]): Promise<Role[]> {
    return roleIds
      .map((roleId) => this.rolesById.get(roleId))
      .filter((role): role is Role => Boolean(role && role.orgId === tenantId));
  }

  async deleteRole(_tenantId: string, roleId: string): Promise<void> {
    this.rolesById.delete(roleId);
  }
}

function createAuthorization(): RepositoryAuthorizationContext {
  return {
    orgId: 'org-1',
    userId: 'admin-1',
    roleKey: 'orgAdmin',
    roleName: 'orgAdmin',
    permissions: { 'org.settings': ['update'] },
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test:org:roles',
    correlationId: 'corr-roles-1',
    tenantScope: {
      orgId: 'org-1',
      dataResidency: 'UK_ONLY',
      dataClassification: 'OFFICIAL',
      auditSource: 'test:org:roles',
    },
  };
}

function createPermissionResource(resource: string, actions: string[], legacyKey?: string): PermissionResource {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: `perm-${resource}`,
    orgId: 'org-1',
    resource,
    actions,
    metadata: legacyKey ? { legacyKeys: [legacyKey] } : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

describe('role use-cases integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createRole rejects unknown permission resources and fails closed', async () => {
    const roleRepository = new InMemoryRoleRepository();

    await expect(
      createRole(
        {
          roleRepository,
          permissionResourceRepository: { listResources: vi.fn(async () => []) },
        },
        {
          authorization: createAuthorization(),
          name: 'Finance Analyst',
          permissions: { 'hr.people.unknown': ['read'] },
        },
      ),
    ).rejects.toThrowError(ValidationError);

    expect(await roleRepository.getRolesByOrganization('org-1')).toHaveLength(0);
    expect(invalidateOrgCacheMock).not.toHaveBeenCalled();
  });

  it('createRole canonicalizes legacy resource aliases and persists validated permissions', async () => {
    const roleRepository = new InMemoryRoleRepository();
    const permissionResourceRepository = {
      listResources: vi.fn(async () => [
        createPermissionResource('custom.audit.log', ['read', 'write'], 'legacy.audit.log'),
      ]),
    };
    const authorization = createAuthorization();

    const created = await createRole(
      { roleRepository, permissionResourceRepository },
      {
        authorization,
        name: 'Audit Support',
        description: 'Custom audit support role',
        scope: RoleScope.ORG,
        permissions: {
          'legacy.audit.log': ['write', 'write'],
        },
      },
    );

    expect(created.name).toBe('Audit Support');
    expect(created.permissions).toEqual({ 'custom.audit.log': ['write'] });
    expect(invalidateOrgCacheMock).toHaveBeenCalledWith(
      'org-1',
      CACHE_SCOPE_ROLES,
      authorization.dataClassification,
      authorization.dataResidency,
    );
  });

  it('updateRole rejects unknown actions for known resources and leaves role unchanged', async () => {
    const existingRole: Role = {
      id: 'role-1',
      orgId: 'org-1',
      name: 'Ops Support',
      description: null,
      scope: RoleScope.ORG,
      permissions: { 'custom.audit.log': ['read'] },
      inheritsRoleIds: [],
      isSystem: false,
      isDefault: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    const roleRepository = new InMemoryRoleRepository([existingRole]);
    const permissionResourceRepository = {
      listResources: vi.fn(async () => [
        createPermissionResource('custom.audit.log', ['read', 'write']),
      ]),
    };

    await expect(
      updateRole(
        { roleRepository, permissionResourceRepository },
        {
          authorization: createAuthorization(),
          roleId: 'role-1',
          permissions: { 'custom.audit.log': ['delete'] },
        },
      ),
    ).rejects.toThrowError(ValidationError);

    const stored = await roleRepository.getRole('org-1', 'role-1');
    expect(stored?.permissions).toEqual({ 'custom.audit.log': ['read'] });
    expect(invalidateOrgCacheMock).not.toHaveBeenCalled();
  });
});

