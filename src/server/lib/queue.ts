import { Queue, type QueueOptions } from 'bullmq';
import Redis, { type RedisOptions } from 'ioredis';
import { appLogger } from '@/server/logging/structured-logger';

const DEFAULT_REDIS_URL = process.env.BULLMQ_REDIS_URL ?? process.env.REDIS_URL ?? 'redis://localhost:6379';
const SHARED_REDIS_OPTIONS: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

let sharedRedisConnection: Redis | null = null;
const queueCache = new Map<string, Queue>();

export type SharedQueueOptions = Omit<QueueOptions, 'connection'>;

export function getSharedRedisConnection(): Redis {
    sharedRedisConnection ??= new Redis(DEFAULT_REDIS_URL, {
        ...SHARED_REDIS_OPTIONS,
        lazyConnect: true,
    });

    sharedRedisConnection.on('error', (error) => {
        appLogger.warn('Redis connection error', {
            error: String(error),
        });
    });
    return sharedRedisConnection;
}

export function getSharedQueue(name: string, options?: SharedQueueOptions): Queue {
    const existing = queueCache.get(name);
    if (existing) {
        return existing;
    }

    const queue = new Queue(name, {
        connection: getSharedRedisConnection(),
        ...options,
    });

    queueCache.set(name, queue);
    return queue;
}
