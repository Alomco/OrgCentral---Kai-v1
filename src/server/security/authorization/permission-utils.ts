import type { OrgPermissionMap } from '@/server/security/access-control';

export function permissionsSatisfy(granted: OrgPermissionMap, required: OrgPermissionMap): boolean {
    for (const [resource, actions] of Object.entries(required)) {
        if (!actions?.length) {
            continue;
        }
        const allowed = granted[resource] ?? [];
        if (!actions.every((action) => allowed.includes(action))) {
            return false;
        }
    }
    return true;
}

export function satisfiesAnyPermissionProfile(
    granted: OrgPermissionMap,
    profiles: readonly OrgPermissionMap[],
): boolean {
    if (!profiles.length) {
        return true;
    }

    return profiles.some((profile) => permissionsSatisfy(granted, profile));
}
