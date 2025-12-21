import Redis from 'ioredis';
import type { CacheEngine, CacheTagRegistrationOptions } from '@/server/lib/cache-engine/types';
import { appLogger } from '@/server/logging/structured-logger';

const DEFAULT_REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export interface RedisCacheEngineOptions {
    redisUrl?: string;
    /** Prefix to isolate keys per environment/app. */
    keyPrefix?: string;
}

/**
 * Redis-backed tag "version" engine.
 *
 * This does NOT integrate with Next.js Data Cache tags automatically.
 * It’s intended for app-level caching where cache keys incorporate tag versions.
 */
export class RedisCacheEngine implements CacheEngine {
    private readonly redis: Redis;
    private readonly prefix: string;

    constructor(options?: RedisCacheEngineOptions) {
        const url = options?.redisUrl ?? DEFAULT_REDIS_URL;
        this.prefix = options?.keyPrefix ?? (process.env.CACHE_KEY_PREFIX ?? 'orgcentral');
        this.redis = new Redis(url, {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });

        this.redis.on('error', (error) => {
            appLogger.warn('Redis cache engine connection error', { error: String(error) });
        });
    }

    registerTag(tag: string, options?: CacheTagRegistrationOptions): void {
        // For Redis versioning, “registering a tag” is a no-op.
        // Use getTagVersion/bumpTagVersion + versioned keys in app-level caches.
        void tag;
        void options;
    }

    async invalidateTag(tag: string): Promise<void> {
        // Treat invalidation as bumping the tag version.
        await this.bumpTagVersion(tag);
    }

    async getTagVersion(tag: string): Promise<number | null> {
        const key = this.tagVersionKey(tag);
        const value = await this.redis.get(key);
        if (!value) {
            return 0;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    async bumpTagVersion(tag: string): Promise<number | null> {
        const key = this.tagVersionKey(tag);
        const next = await this.redis.incr(key);
        return typeof next === 'number' ? next : Number(next);
    }

    private tagVersionKey(tag: string): string {
        return `${this.prefix}:tagv:${tag}`;
    }
}
