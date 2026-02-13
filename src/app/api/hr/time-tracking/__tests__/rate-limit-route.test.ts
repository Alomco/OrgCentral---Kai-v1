import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RateLimitError } from '@/server/errors';

const controllers = vi.hoisted(() => ({
    createTimeEntryRouteController: vi.fn(),
    listTimeEntriesRouteController: vi.fn(),
    getTimeEntryRouteController: vi.fn(),
    updateTimeEntryRouteController: vi.fn(),
    approveTimeEntryRouteController: vi.fn(),
}));

const guards = vi.hoisted(() => ({
    enforceCsrfOriginGuard: vi.fn(),
}));

vi.mock('@/server/api-adapters/hr/time-tracking/time-tracking-route-controllers', () => controllers);
vi.mock('@/server/security/guards/csrf-origin-guard', () => guards);

import { POST as postCreate } from '../route';
import { PATCH as patchEntry } from '../[entryId]/route';
import { POST as postApprove } from '../[entryId]/approve/route';

function buildRateLimitError(): RateLimitError {
    return new RateLimitError('Rate limit exceeded for time entry creation.', {
        retryAfterSeconds: 9,
        limit: 1,
        remaining: 0,
        resetAt: 1_900_000_000,
    });
}

describe('hr time-tracking route rate-limit mapping', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        guards.enforceCsrfOriginGuard.mockResolvedValue(null);
    });

    it('maps POST /api/hr/time-tracking rate-limit errors to 429 with headers', async () => {
        controllers.createTimeEntryRouteController.mockRejectedValue(buildRateLimitError());

        const response = await postCreate(new Request('http://localhost/api/hr/time-tracking', { method: 'POST' }));
        const payload = await response.json();

        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBe('9');
        expect(response.headers.get('X-RateLimit-Limit')).toBe('1');
        expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(response.headers.get('X-RateLimit-Reset')).toBe('1900000000');
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Rate limit exceeded for time entry creation.',
                    details: expect.objectContaining({ retryAfterSeconds: 9 }),
                }),
            }),
        );
    });

    it('maps PATCH /api/hr/time-tracking/[entryId] rate-limit errors to 429 with headers', async () => {
        controllers.updateTimeEntryRouteController.mockRejectedValue(buildRateLimitError());

        const response = await patchEntry(
            new Request('http://localhost/api/hr/time-tracking/entry-1', { method: 'PATCH' }),
            { params: Promise.resolve({ entryId: 'entry-1' }) },
        );
        const payload = await response.json();

        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBe('9');
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'RATE_LIMIT_EXCEEDED' }),
            }),
        );
    });

    it('maps POST /api/hr/time-tracking/[entryId]/approve rate-limit errors to 429 with headers', async () => {
        controllers.approveTimeEntryRouteController.mockRejectedValue(buildRateLimitError());

        const response = await postApprove(
            new Request('http://localhost/api/hr/time-tracking/entry-1/approve', { method: 'POST' }),
            { params: Promise.resolve({ entryId: 'entry-1' }) },
        );
        const payload = await response.json();

        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBe('9');
        expect(payload).toEqual(
            expect.objectContaining({
                error: expect.objectContaining({ code: 'RATE_LIMIT_EXCEEDED' }),
            }),
        );
    });

    it('returns typed invalid-origin response from guard and skips mutation controllers', async () => {
        const guardResponse = new Response(
            JSON.stringify({ error: { code: 'AUTHORIZATION_ERROR', message: 'Invalid origin.' } }),
            {
                status: 403,
                headers: { 'content-type': 'application/json' },
            },
        );
        guards.enforceCsrfOriginGuard.mockResolvedValue(guardResponse);

        const createResponse = await postCreate(new Request('http://localhost/api/hr/time-tracking', { method: 'POST' }));
        const patchResponse = await patchEntry(
            new Request('http://localhost/api/hr/time-tracking/entry-1', { method: 'PATCH' }),
            { params: Promise.resolve({ entryId: 'entry-1' }) },
        );
        const approveResponse = await postApprove(
            new Request('http://localhost/api/hr/time-tracking/entry-1/approve', { method: 'POST' }),
            { params: Promise.resolve({ entryId: 'entry-1' }) },
        );

        expect(createResponse.status).toBe(403);
        expect(patchResponse.status).toBe(403);
        expect(approveResponse.status).toBe(403);
        expect(controllers.createTimeEntryRouteController).not.toHaveBeenCalled();
        expect(controllers.updateTimeEntryRouteController).not.toHaveBeenCalled();
        expect(controllers.approveTimeEntryRouteController).not.toHaveBeenCalled();
    });
});
