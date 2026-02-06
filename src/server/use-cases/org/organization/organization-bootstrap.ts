import type { IRoleRepository } from '@/server/repositories/contracts/org/roles/role-repository-contract';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import type { Role } from '@/server/types/hr-types';
import { DEFAULT_BOOTSTRAP_POLICIES } from '@/server/security/abac-constants';
import { ROLE_TEMPLATES } from '@/server/security/role-templates';
import { TENANT_ROLE_KEYS } from '@/server/security/role-constants';

export type OrganizationRoleRepository = Pick<
    IRoleRepository,
    'createRole' | 'updateRole' | 'getRolesByOrganization'
>;

export type OrganizationAbacRepository = Pick<
    IAbacPolicyRepository,
    'getPoliciesForOrg' | 'setPoliciesForOrg'
>;

export async function ensureBuiltinRoles(
    roleRepository: OrganizationRoleRepository,
    orgId: string,
): Promise<void> {
    const existing = await roleRepository.getRolesByOrganization(orgId);
    const byName = new Map(existing.map((role) => [role.name, role]));

    const normalizePermissions = (input: Role['permissions']): Record<string, string[]> => {
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            return {};
        }
        return Object.entries(input as Record<string, unknown>).reduce<Record<string, string[]>>(
            (accumulator, [resource, actions]) => {
                if (!Array.isArray(actions)) {
                    return accumulator;
                }
                const filtered = actions.filter((action): action is string => typeof action === 'string');
                if (filtered.length > 0) {
                    accumulator[resource] = filtered;
                }
                return accumulator;
            },
            {});
    };

    const permissionsEqual = (left: Role['permissions'], right: Role['permissions']): boolean => {
        const normalizedLeft = normalizePermissions(left);
        const normalizedRight = normalizePermissions(right);
        const leftKeys = Object.keys(normalizedLeft).sort();
        const rightKeys = Object.keys(normalizedRight).sort();
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }
        for (let index = 0; index < leftKeys.length; index += 1) {
            if (leftKeys[index] !== rightKeys[index]) {
                return false;
            }
            const leftActions = Array.from(new Set(normalizedLeft[leftKeys[index]] ?? [])).sort();
            const rightActions = Array.from(new Set(normalizedRight[rightKeys[index]] ?? [])).sort();
            if (leftActions.length !== rightActions.length) {
                return false;
            }
            for (let actionIndex = 0; actionIndex < leftActions.length; actionIndex += 1) {
                if (leftActions[actionIndex] !== rightActions[actionIndex]) {
                    return false;
                }
            }
        }
        return true;
    };

    for (const roleKey of TENANT_ROLE_KEYS) {
        const template = ROLE_TEMPLATES[roleKey];
        const existingRole = byName.get(template.name);
        if (existingRole) {
            const shouldSync = Boolean(template.isSystem) && (existingRole.isSystem ?? true);
            if (shouldSync && (
                !permissionsEqual(existingRole.permissions, template.permissions as Role['permissions']) ||
                existingRole.description !== template.description ||
                existingRole.scope !== template.scope ||
                existingRole.isDefault !== template.isDefault
            )) {
                await roleRepository.updateRole(orgId, existingRole.id, {
                    description: template.description,
                    scope: template.scope,
                    permissions: template.permissions as Role['permissions'],
                    isSystem: template.isSystem ?? false,
                    isDefault: template.isDefault ?? false,
                });
            }
            continue;
        }
        await roleRepository.createRole(orgId, {
            orgId,
            name: template.name,
            description: template.description,
            scope: template.scope,
            permissions: template.permissions as Role['permissions'],
            inheritsRoleIds: [],
            isSystem: template.isSystem ?? false,
            isDefault: template.isDefault ?? false,
        });
    }

    const refreshed = await roleRepository.getRolesByOrganization(orgId);
    const refreshedByName = new Map(refreshed.map((role) => [role.name, role]));

    for (const roleKey of TENANT_ROLE_KEYS) {
        const template = ROLE_TEMPLATES[roleKey];
        const role = refreshedByName.get(template.name);
        if (!role || !template.inherits?.length) {
            continue;
        }
        const inheritedRoleIds = template.inherits
            .map((name) => refreshedByName.get(name)?.id)
            .filter((id): id is string => typeof id === 'string');
        await roleRepository.updateRole(orgId, role.id, { inheritsRoleIds: inheritedRoleIds });
    }
}

export async function ensureAbacPolicies(
    abacRepository: OrganizationAbacRepository,
    orgId: string,
): Promise<void> {
    const existing = await abacRepository.getPoliciesForOrg(orgId);
    if (existing.length > 0) {
        return;
    }
    await abacRepository.setPoliciesForOrg(orgId, DEFAULT_BOOTSTRAP_POLICIES);
}
