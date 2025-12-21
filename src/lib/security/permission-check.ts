import type { OrgPermissionMap } from '@/server/security/access-control';

export function hasRequiredPermissions(
    granted: OrgPermissionMap | null | undefined,
    required: OrgPermissionMap | null | undefined,
): boolean {
    if (!required || Object.keys(required).length === 0) {
        return true;
    }
    if (!granted) {
        return false;
    }

    for (const [resource, actions] of Object.entries(required)) {
        if (!actions?.length) {
            continue;
        }
        const allowed = granted[resource] ?? [];
        for (const action of actions) {
            if (!allowed.includes(action)) {
                return false;
            }
        }
    }

    return true;
}

export function hasPermission(
    granted: OrgPermissionMap | null | undefined,
    resource: string,
    action: string,
): boolean {
    const allowed = granted?.[resource] ?? [];
    return allowed.includes(action);
}
