import { timingSafeEqual } from 'node:crypto';
import { AuthorizationError, ValidationError } from '@/server/errors';
import { isOrgRoleKey, type OrgRoleKey } from '@/server/security/access-control';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_PLATFORM_ORG_SLUG = 'orgcentral-platform';
const DEFAULT_PLATFORM_ORG_NAME = 'OrgCentral Platform';
const DEFAULT_PLATFORM_TENANT_ID = 'orgcentral-platform';
const DEFAULT_PLATFORM_REGION_CODE = 'UK-LON';
const DEFAULT_GLOBAL_ADMIN_ROLE: OrgRoleKey = 'globalAdmin';
export { BOOTSTRAP_SEED_SOURCE } from '@/server/constants/bootstrap';

export interface PlatformBootstrapConfig {
    platformOrgSlug: string;
    platformOrgName: string;
    platformTenantId: string;
    platformRegionCode: string;
    roleName: OrgRoleKey;
}

export function resolvePlatformConfig(): PlatformBootstrapConfig {
    const roleCandidate = process.env.GLOBAL_ADMIN_ROLE_NAME ?? DEFAULT_GLOBAL_ADMIN_ROLE;

    if (!isOrgRoleKey(roleCandidate)) {
        throw new ValidationError('GLOBAL_ADMIN_ROLE_NAME must be one of the built-in role keys.');
    }

    return {
        platformOrgSlug: process.env.PLATFORM_ORG_SLUG ?? DEFAULT_PLATFORM_ORG_SLUG,
        platformOrgName: process.env.PLATFORM_ORG_NAME ?? DEFAULT_PLATFORM_ORG_NAME,
        platformTenantId: process.env.PLATFORM_TENANT_ID ?? DEFAULT_PLATFORM_TENANT_ID,
        platformRegionCode: process.env.PLATFORM_ORG_REGION ?? DEFAULT_PLATFORM_REGION_CODE,
        roleName: roleCandidate,
    };
}

export function isBootstrapEnabled(): boolean {
    return process.env.ENABLE_ADMIN_BOOTSTRAP === 'true';
}

export function requireBootstrapSecret(): string {
    const secret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (typeof secret !== 'string' || secret.trim().length === 0) {
        throw new AuthorizationError('Admin bootstrap is disabled.');
    }
    return secret;
}

export function constantTimeEquals(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    if (aBuffer.length !== bBuffer.length) {
        return false;
    }
    return timingSafeEqual(aBuffer, bBuffer);
}

function isUuid(value: string): boolean {
    return UUID_REGEX.test(value);
}

export function assertUuid(value: string, name: string): void {
    if (!isUuid(value)) {
        throw new ValidationError(`${name} must be a UUID. Configure Better Auth to generate UUID ids.`);
    }
}
