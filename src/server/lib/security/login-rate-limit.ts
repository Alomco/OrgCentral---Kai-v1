import { createHash } from 'node:crypto';

interface RateLimitState {
    count: number;
    resetAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
}

const loginAttemptCache = new Map<string, RateLimitState>();

export function checkLoginRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number,
): RateLimitResult {
    const now = Date.now();
    const existing = loginAttemptCache.get(key);

    if (!existing || existing.resetAt <= now) {
        loginAttemptCache.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    }

    if (existing.count >= maxRequests) {
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
