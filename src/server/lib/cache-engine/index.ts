import type { CacheEngine, CacheEngineFactoryOptions, CacheEngineKind } from '@/server/lib/cache-engine/types';
import { NextCacheEngine } from '@/server/lib/cache-engine/backends/next-cache-engine';
import { NoopCacheEngine } from '@/server/lib/cache-engine/backends/noop-cache-engine';
import { RedisCacheEngine } from '@/server/lib/cache-engine/backends/redis-cache-engine';

let singleton: CacheEngine | null = null;
let singletonKind: CacheEngineKind | null = null;

function resolveKind(explicit?: CacheEngineKind): CacheEngineKind {
    const raw = (explicit ?? (process.env.CACHE_ENGINE as CacheEngineKind | undefined) ?? 'next').toLowerCase();
    if (raw === 'redis' || raw === 'noop' || raw === 'next') {
        return raw;
    }
    return 'next';
}

export function getCacheEngine(options?: CacheEngineFactoryOptions): CacheEngine {
    const kind = resolveKind(options?.kind);
    if (singleton && singletonKind === kind) {
        return singleton;
    }

    singletonKind = kind;

    switch (kind) {
        case 'noop':
            singleton = new NoopCacheEngine();
            return singleton;
        case 'redis':
            singleton = new RedisCacheEngine({ redisUrl: options?.redisUrl });
            return singleton;
        case 'next':
        default:
            singleton = new NextCacheEngine();
            return singleton;
    }
}

export function resetCacheEngineForTests(): void {
    singleton = null;
    singletonKind = null;
}
