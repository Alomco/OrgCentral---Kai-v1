import type { OrgPermissionMap } from '@/server/security/access-control';

const DEVELOPMENT_SUPER_ADMIN_METADATA_FLAG = 'devSuperAdmin';
const ADMIN_BOOTSTRAP_SEED_SOURCE = 'api/auth/admin-bootstrap';

export function isDevelopmentSuperAdminMembership(metadata: unknown, permissions: OrgPermissionMap): boolean {
    if (process.env.NODE_ENV !== 'development') {
        return false;
    }

    if (!permissions.organization?.includes('governance')) {
        return false;
    }

    if (!metadata || typeof metadata !== 'object') {
        return false;
    }

    const record = metadata as Record<string, unknown>;
    if (record[DEVELOPMENT_SUPER_ADMIN_METADATA_FLAG] === true) {
        return true;
    }

    return record.seedSource === ADMIN_BOOTSTRAP_SEED_SOURCE;
}
