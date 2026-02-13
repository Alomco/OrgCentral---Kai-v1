import { describe, expect, it } from 'vitest';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { RateLimitError } from '@/server/errors';
import { checkTimeTrackingRateLimit } from '@/server/lib/security/time-tracking-rate-limit';

function uniqueRateLimitKey(): string {
    return `time-tracking-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

describe('time-tracking rate-limit deterministic behavior', () => {
    it('returns disallowed state with deterministic 429 metadata on second request', async () => {
        const key = uniqueRateLimitKey();
        const windowMs = 5_000;
        const maxRequests = 1;

        const first = await checkTimeTrackingRateLimit(key, windowMs, maxRequests);
        const second = await checkTimeTrackingRateLimit(key, windowMs, maxRequests);

        expect(first.allowed).toBe(true);
        expect(first.limit).toBe(1);
        expect(second.allowed).toBe(false);
        expect(second.remaining).toBe(0);
        expect(second.limit).toBe(1);
        expect(second.retryAfterSeconds).toBeGreaterThanOrEqual(1);
        expect(second.resetAt).toBeGreaterThanOrEqual(Math.ceil(Date.now() / 1000));

        const response = buildErrorResponse(new RateLimitError('Rate limit exceeded for deterministic test.', {
            retryAfterSeconds: second.retryAfterSeconds,
            limit: second.limit,
            remaining: second.remaining,
            resetAt: second.resetAt,
        }));

        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBe(String(second.retryAfterSeconds));
        expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(response.headers.get('X-RateLimit-Reset')).toBe(String(second.resetAt));

        const body = await response.json();
        expect(body).toEqual({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded for deterministic test.',
                details: {
                    retryAfterSeconds: second.retryAfterSeconds,
                    limit: 1,
                    remaining: 0,
                    resetAt: second.resetAt,
                },
            },
        });
    });

    it('resets counters after configured rate-limit window', async () => {
        const key = uniqueRateLimitKey();
        const windowMs = 60;
        const maxRequests = 1;

        const first = await checkTimeTrackingRateLimit(key, windowMs, maxRequests);
        const second = await checkTimeTrackingRateLimit(key, windowMs, maxRequests);
        await new Promise((resolve) => setTimeout(resolve, 90));
        const third = await checkTimeTrackingRateLimit(key, windowMs, maxRequests);

        expect(first.allowed).toBe(true);
        expect(second.allowed).toBe(false);
        expect(third.allowed).toBe(true);
        expect(third.remaining).toBe(0);
        expect(third.limit).toBe(1);
    });
});
