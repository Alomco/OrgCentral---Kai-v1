import { createHash } from 'node:crypto';

import { prisma } from '@/server/lib/prisma';
import { appLogger } from '@/server/logging/structured-logger';
import { RateLimitError } from '@/server/errors';

interface RateLimitState {
    count: number;
    resetAt: number;
}

export interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
    remaining: number;
    limit: number;
    resetAt: number;
}

interface RateLimitBucketRow {
    value: string;
    expiresAt: Date;
}

const TIME_TRACKING_RATE_LIMIT_IDENTIFIER = 'hr.time-tracking.rate-limit';
const timeTrackingRateLimitFallbackCache = new Map<string, RateLimitState>();
const TIME_TRACKING_RATE_LIMIT_ERROR_MESSAGE = {
    create: 'Rate limit exceeded for time entry creation.',
    update: 'Rate limit exceeded for time entry updates.',
    approve: 'Rate limit exceeded for time entry approvals.',
    reject: 'Rate limit exceeded for time entry rejections.',
} as const;

export type TimeTrackingRateLimitAction =
    keyof typeof TIME_TRACKING_RATE_LIMIT_ERROR_MESSAGE;

function extractFirstHeaderValue(headers: Headers, name: string): string | undefined {
    const raw = headers.get(name);
    if (!raw) {
        return undefined;
    }

    const [first] = raw.split(',');
    const trimmed = first.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function extractIpAddressFromHeaders(headers: Headers | HeadersInit): string | undefined {
    const normalized = headers instanceof Headers ? headers : new Headers(headers);
    return (
        extractFirstHeaderValue(normalized, 'x-forwarded-for')
        ?? extractFirstHeaderValue(normalized, 'x-real-ip')
    );
}

export function resolveTimeTrackingRateLimitConfig(): { windowMs: number; maxRequests: number } {
    const maxRaw = process.env.TIME_TRACKING_RATE_LIMIT_MAX;
    const windowRaw = process.env.TIME_TRACKING_RATE_LIMIT_WINDOW_MS;
    const maxRequests = maxRaw ? Number(maxRaw) : 10;
    const windowMs = windowRaw ? Number(windowRaw) : 60_000;

    return {
        maxRequests: Number.isFinite(maxRequests) && maxRequests > 0 ? maxRequests : 10,
        windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
    };
}

export async function checkTimeTrackingRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number,
): Promise<RateLimitResult> {
    try {
        return await checkTimeTrackingRateLimitWithSharedStorage(key, windowMs, maxRequests);
    } catch (error) {
        appLogger.warn('hr.time-tracking.rate-limit.shared-storage-unavailable', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return checkTimeTrackingRateLimitInMemory(key, windowMs, maxRequests);
    }
}

async function checkTimeTrackingRateLimitWithSharedStorage(
    key: string,
    windowMs: number,
    maxRequests: number,
): Promise<RateLimitResult> {
    const now = Date.now();
    const expiresAt = new Date(now + windowMs);
    const bucketId = `time-tracking-rate-limit:${key}`;
    const limit = Math.max(1, maxRequests);

    const rows = await prisma.$queryRaw<RateLimitBucketRow[]>`
        INSERT INTO "auth"."verification" ("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt")
        VALUES (${bucketId}, ${TIME_TRACKING_RATE_LIMIT_IDENTIFIER}, '1', ${expiresAt}, NOW(), NOW())
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

    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.expiresAt.getTime() - now) / 1000));
    const remaining = Math.max(0, limit - count);

    return {
        allowed: count <= limit,
        retryAfterSeconds,
        remaining,
        limit,
        resetAt: Math.ceil(bucket.expiresAt.getTime() / 1000),
    };
}

function checkTimeTrackingRateLimitInMemory(
    key: string,
    windowMs: number,
    maxRequests: number,
): RateLimitResult {
    const now = Date.now();
    const limit = Math.max(1, maxRequests);
    const existing = timeTrackingRateLimitFallbackCache.get(key);

    if (!existing || existing.resetAt <= now) {
        timeTrackingRateLimitFallbackCache.set(key, { count: 1, resetAt: now + windowMs });
        return {
            allowed: true,
            retryAfterSeconds: Math.ceil(windowMs / 1000),
            remaining: Math.max(0, limit - 1),
            limit,
            resetAt: Math.ceil((now + windowMs) / 1000),
        };
    }

    if (existing.count >= limit) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        return {
            allowed: false,
            retryAfterSeconds,
            remaining: 0,
            limit,
            resetAt: Math.ceil(existing.resetAt / 1000),
        };
    }

    existing.count += 1;
    return {
        allowed: true,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        remaining: Math.max(0, limit - existing.count),
        limit,
        resetAt: Math.ceil(existing.resetAt / 1000),
    };
}

export function buildTimeTrackingRateLimitKey(input: {
    orgId: string;
    userId: string;
    ipAddress?: string;
    action: string;
}): string {
    const normalizedOrg = input.orgId.trim().toLowerCase();
    const normalizedUser = input.userId.trim().toLowerCase();
    const normalizedAction = input.action.trim().toLowerCase();
    const ip = input.ipAddress?.trim() ?? 'unknown';
    const raw = `${normalizedOrg}:${normalizedUser}:${ip}:${normalizedAction}`;
    return createHash('sha256').update(raw).digest('hex');
}

export async function enforceTimeTrackingMutationRateLimit(input: {
    authorization: {
        orgId: string;
        userId: string;
    };
    headers: Headers | HeadersInit;
    action: TimeTrackingRateLimitAction;
}): Promise<void> {
    const { maxRequests, windowMs } = resolveTimeTrackingRateLimitConfig();
    const key = buildTimeTrackingRateLimitKey({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        ipAddress: extractIpAddressFromHeaders(input.headers),
        action: input.action,
    });
    const rateLimit = await checkTimeTrackingRateLimit(key, windowMs, maxRequests);

    if (!rateLimit.allowed) {
        throw new RateLimitError(TIME_TRACKING_RATE_LIMIT_ERROR_MESSAGE[input.action], {
            retryAfterSeconds: rateLimit.retryAfterSeconds,
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
        });
    }
}
