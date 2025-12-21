import type { CacheEngine } from '@/server/lib/cache-engine/types';

export class NoopCacheEngine implements CacheEngine {
    registerTag(): void {
        // intentionally noop
    }

    async invalidateTag(): Promise<void> {
        // intentionally noop
    }

    getTagVersion(): Promise<number | null> {
        return Promise.resolve(null);
    }

    bumpTagVersion(): Promise<number | null> {
        return Promise.resolve(null);
    }
}
