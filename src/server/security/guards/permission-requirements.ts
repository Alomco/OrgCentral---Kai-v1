import type { OrgPermissionMap, OrgRoleKey } from '@/server/security/access-control';

export { buildAnyPermissionProfiles, normalizePermissionRequirement } from '@/server/security/authorization/permission-requirements';
export { permissionsSatisfy } from '@/server/security/authorization/permission-utils';

export function resolveGrantedPermissions(
    roleKey: OrgRoleKey | 'custom',
    combineRoleStatements: (roleKeys: OrgRoleKey[]) => OrgPermissionMap,
    customPermissions?: unknown,
): OrgPermissionMap {
    if (roleKey !== 'custom') {
        return combineRoleStatements([roleKey]);
    }

    if (!customPermissions || typeof customPermissions !== 'object' || Array.isArray(customPermissions)) {
        return {};
    }

    const record = customPermissions as Record<string, unknown>;

    const normalized: OrgPermissionMap = {};
    for (const [resource, actions] of Object.entries(record)) {
        if (!Array.isArray(actions) || actions.length === 0) {
            continue;
        }
        const filtered = actions.filter(
            (action): action is string => typeof action === 'string' && action.length > 0,
        );
        if (filtered.length > 0) {
            normalized[resource] = filtered;
        }
    }
    return normalized;
}
