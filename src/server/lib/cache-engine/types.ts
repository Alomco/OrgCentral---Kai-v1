import type { CacheTagPayload } from '@/server/lib/cache-tags';

export interface CacheTagRegistrationOptions {
    /**
     * Marks a tag registration as sensitive.
     *
     * For sensitive data (currently: classification != OFFICIAL), the Next.js engine will
     * opt-out of caching via `unstable_noStore()` and will NOT register cache tags.
     */
    shortLived?: boolean;
}

export interface CacheEngine {
    /**
     * Register a tag for the current request / render context.
     *
     * In Next.js this maps to cacheTag(tag) (+ optional cacheLife).
     */
    registerTag(tag: string, options?: CacheTagRegistrationOptions): void;

    /**
     * Invalidate a tag globally.
     *
     * In Next.js this maps to revalidateTag(tag).
     */
    invalidateTag(tag: string): Promise<void>;

    /**
     * Optional: engines may support tag versioning for key-value caches.
     * When unsupported, return null.
     */
    getTagVersion?(tag: string): Promise<number | null>;

    /**
     * Optional: bump the tag version for key-value caches.
     * When unsupported, return null.
     */
    bumpTagVersion?(tag: string): Promise<number | null>;
}

export type CacheEngineKind = 'next' | 'redis' | 'noop';

export interface CacheEngineFactoryOptions {
    /** Override CACHE_ENGINE for tests / scripts. */
    kind?: CacheEngineKind;

    /**
     * Redis connection URL used by the redis engine.
     * Defaults to REDIS_URL (or localhost fallback).
     */
    redisUrl?: string;
}

export function isSensitivePayload(payload: CacheTagPayload): boolean {
    return payload.classification !== 'OFFICIAL';
}
