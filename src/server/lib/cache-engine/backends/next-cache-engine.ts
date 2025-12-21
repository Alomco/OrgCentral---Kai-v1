import type { CacheEngine, CacheTagRegistrationOptions } from '@/server/lib/cache-engine/types';

export class NextCacheEngine implements CacheEngine {
    registerTag(tag: string, options?: CacheTagRegistrationOptions): void {
        // Import at call-time to keep the module safe in non-Next runtimes.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        void this.registerTagInternal(tag, options);
    }

    private async registerTagInternal(tag: string, options?: CacheTagRegistrationOptions): Promise<void> {
        try {
            const cache = await import('next/cache');
            const cacheTag = (cache as { cacheTag?: (tag: string) => void }).cacheTag;
            const cacheLife = (cache as { cacheLife?: (profile: string) => void }).cacheLife;
            const noStore = (cache as { unstable_noStore?: () => void }).unstable_noStore;

            // Sensitive data: do not cache at all (and do not register tags).
            if (options?.shortLived && typeof noStore === 'function') {
                noStore();
                return;
            }

            if (typeof cacheTag === 'function') {
                cacheTag(tag);
            }

            // Non-sensitive data may still choose cacheLife profiles outside the cache engine.
            // Keep a conservative fallback for runtimes that register tags but want short TTL.
            if (options?.shortLived && typeof cacheLife === 'function') {
                cacheLife('seconds');
            }
        } catch {
            // best-effort: allow code to run in workers/tests
        }
    }

    async invalidateTag(tag: string): Promise<void> {
        try {
            const cache = await import('next/cache');
            const revalidateTag = (cache as { revalidateTag?: (tag: string, option?: unknown) => unknown }).revalidateTag;
            if (typeof revalidateTag === 'function') {
                await Promise.resolve(revalidateTag(tag, 'seconds'));
            }
        } catch {
            // best-effort invalidation
        }
    }

    getTagVersion(): Promise<number | null> {
        return Promise.resolve(null);
    }

    bumpTagVersion(): Promise<number | null> {
        return Promise.resolve(null);
    }
}
