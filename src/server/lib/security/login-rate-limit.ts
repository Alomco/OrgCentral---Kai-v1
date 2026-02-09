import { createHash } from 'node:crypto';

import { prisma } from '@/server/lib/prisma';
import { appLogger } from '@/server/logging/structured-logger';

interface RateLimitState {
    count: number;
    resetAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
}

interface RateLimitBucketRow {
    value: string;
    expiresAt: Date;
}

const LOGIN_RATE_LIMIT_IDENTIFIER = 'auth.login.rate-limit';
const loginAttemptFallbackCache = new Map<string, RateLimitState>();

export async function checkLoginRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number,
): Promise<RateLimitResult> {
    try {
        return await checkLoginRateLimitWithSharedStorage(key, windowMs, maxRequests);
    } catch (error) {
        appLogger.warn('auth.login.rate-limit.shared-storage-unavailable', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return checkLoginRateLimitInMemory(key, windowMs, maxRequests);
    }
}

async function checkLoginRateLimitWithSharedStorage(
    key: string,
    windowMs: number,
    maxRequests: number,
): Promise<RateLimitResult> {
    const now = Date.now();
    const expiresAt = new Date(now + windowMs);
    const bucketId = `login-rate-limit:${key}`;
    const limit = Math.max(1, maxRequests);

    const rows = await prisma.$queryRaw<RateLimitBucketRow[]>`
        INSERT INTO "auth"."verification" ("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt")
        VALUES (${bucketId}, ${LOGIN_RATE_LIMIT_IDENTIFIER}, '1', ${expiresAt}, NOW(), NOW())
        ON CONFLICT ("id")
        DO UPDATE SET
            "value" = CASE
                WHEN "auth"."verification"."expiresAt" <= NOW() THEN '1'
                ELSE (("auth"."verification"."value")::integer + 1)::text
            END,
            "expiresAt" = CASE
                WHEN "auth"."verification"."expiresAt" <= NOW() THEN EXCLUDED."expiresAt"
                ELSE "auth"."verification"."expiresAt"
            END,
            "identifier" = EXCLUDED."identifier",
            "updatedAt" = NOW()
        RETURNING "value", "expiresAt"
    `;

    const bucket = rows.at(0);
    if (!bucket) {
        throw new Error('Rate limit storage did not return a bucket row.');
    }

    const count = Number.parseInt(bucket.value, 10);
    if (!Number.isFinite(count)) {
        throw new Error('Rate limit bucket contained a non-numeric counter.');
    }

    const retryAfterSeconds = Math.max(
        1,
        Math.ceil((bucket.expiresAt.getTime() - now) / 1000),
    );

    return {
        allowed: count <= limit,
        retryAfterSeconds,
    };
}

function checkLoginRateLimitInMemory(
    key: string,
    windowMs: number,
    maxRequests: number,
): RateLimitResult {
    const now = Date.now();
    const existing = loginAttemptFallbackCache.get(key);
    const limit = Math.max(1, maxRequests);

    if (!existing || existing.resetAt <= now) {
        loginAttemptFallbackCache.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    }

    if (existing.count >= limit) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        return { allowed: false, retryAfterSeconds };
    }

    existing.count += 1;
    return { allowed: true, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
}

export function buildLoginRateLimitKey(input: {
    orgSlug: string;
    email: string;
    ipAddress?: string;
}): string {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedOrg = input.orgSlug.trim().toLowerCase();
    const ip = input.ipAddress?.trim() ?? 'unknown';
    const raw = `${normalizedOrg}:${normalizedEmail}:${ip}`;
    return createHash('sha256').update(raw).digest('hex');
}
