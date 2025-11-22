import { RepositoryAuthorizationError } from '@/server/repositories/security';

export function ensureOrgMatch<T extends { orgId?: string | null }>(
    record: T | null | undefined,
    orgId: string,
    message: string,
): T {
    if (!record || record.orgId !== orgId) {
        throw new RepositoryAuthorizationError(message);
    }
    return record;
}

export function ensureOrgUserMatch<T extends { orgId?: string | null; userId?: string | null }>(
    record: T | null | undefined,
    orgId: string,
    userId: string,
    message: string,
): T {
    if (!record || record.orgId !== orgId || record.userId !== userId) {
        throw new RepositoryAuthorizationError(message);
    }
    return record;
}
