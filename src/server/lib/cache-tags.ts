import { cacheLife, cacheTag } from 'next/cache';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

/**
 * Cache scope for different types of data
 * Common values: 'org-profile', 'leave-entitlements', 'leave-requests', 'members'
 * Can also be any custom string value
 */
export type CacheScope = string;

export interface CacheTagPayload {
    orgId: string;
    scope: CacheScope;
    classification: DataClassificationLevel;
    residency: DataResidencyZone;
}

let revalidateTagReference: ((tag: string) => Promise<void>) | null = null;

async function getRevalidateTag(): Promise<(tag: string) => Promise<void>> {
    if (!revalidateTagReference) {
        try {
            const cacheModule = await import('next/cache');
            revalidateTagReference = cacheModule.revalidateTag;
        } catch {
            revalidateTagReference = async () => Promise.resolve();
        }
    }

    return revalidateTagReference;
}

export function buildCacheTag({ orgId, scope, classification, residency }: CacheTagPayload): string {
    return `org:${orgId}:${classification}:${residency}:${scope}`;
}

export function registerCacheTag(payload: CacheTagPayload): void {
    cacheTag(buildCacheTag(payload));

    if (payload.classification !== 'OFFICIAL') {
        cacheLife('seconds', 30);
    }
}

export async function invalidateCache(payload: CacheTagPayload): Promise<void> {
    const revalidate = await getRevalidateTag();
    await revalidate(buildCacheTag(payload));
}

/**
 * Convenience helper to invalidate cache for an org-scoped resource
 * Requires tenant context to be available (e.g., from service context or headers)
 */
export async function invalidateOrgCache(
    orgId: string,
    scope: CacheScope,
    classification: DataClassificationLevel = 'OFFICIAL',
    residency: DataResidencyZone = 'UK'
): Promise<void> {
    await invalidateCache({ orgId, scope, classification, residency });
}

/**
 * Convenience helper to register cache tag for an org-scoped resource
 */
export function registerOrgCacheTag(
    orgId: string,
    scope: CacheScope,
    classification: DataClassificationLevel = 'OFFICIAL',
    residency: DataResidencyZone = 'UK'
): void {
    registerCacheTag({ orgId, scope, classification, residency });
}
