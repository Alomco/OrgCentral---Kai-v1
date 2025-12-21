import type { OrgPermissionMap } from '@/server/security/access-control';

export function normalizePermissionRequirement(input: OrgPermissionMap | undefined): OrgPermissionMap {
    if (!input) {
        return {};
    }

    const normalized: OrgPermissionMap = {};
    for (const [resource, actions] of Object.entries(input)) {
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

export function buildAnyPermissionProfiles(
    profiles: readonly OrgPermissionMap[] | undefined,
): readonly OrgPermissionMap[] {
    if (!profiles?.length) {
        return [];
    }

    return profiles
        .map((profile) => normalizePermissionRequirement(profile))
        .filter((profile) => Object.keys(profile).length > 0);
}
