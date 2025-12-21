import { describe, expect, it, vi } from 'vitest';
import { SenderXEmailProvider } from '@/server/services/notifications/providers/senderx-email-provider';

function createResponse(body: unknown, init?: Partial<Response>): Response {
    return {
        ok: init?.ok ?? true,
        status: init?.status ?? 200,
        json: async () => body,
    } as Response;
}

describe('SenderXEmailProvider', () => {
    it('sends payload with configured headers', async () => {
        const fetcher = vi.fn().mockResolvedValue(
            createResponse({ code: 200, message: 'ok', data: { messageId: 'abc', status: 'sent' }, error: false }),
        );
        const provider = new SenderXEmailProvider({
            apiKey: 'test-key',
            endpoint: 'https://example.com/send',
            defaultBrandName: 'OrgCentral',
            defaultFromAddress: 'OrgCentral <no-reply@example.com>',
            useTracker: true,
            fetcher,
        });

        const result = await provider.sendEmail({
            to: 'user@example.com',
            subject: 'Hello',
            content: '<p>Hi</p>',
            isHtml: true,
            correlationId: 'corr-123',
        });

        expect(result.messageId).toBe('abc');
        expect(fetcher).toHaveBeenCalledWith(
            'https://example.com/send',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({ 'api-key': 'test-key', 'x-correlation-id': 'corr-123' }),
            }),
        );
    });

    it('throws when API key is missing', async () => {
        const fetcher = vi.fn();
        const provider = new SenderXEmailProvider({ endpoint: 'https://example.com', fetcher });
        await expect(
            provider.sendEmail({ to: 'user@example.com', subject: 'Hello', content: 'body', isHtml: false }),
        ).rejects.toThrow('SenderX API key is not configured');
    });

    it('throws on error response', async () => {
        const fetcher = vi.fn().mockResolvedValue(
            createResponse({ message: 'bad request', error: true }, { ok: false, status: 400 }),
        );
        const provider = new SenderXEmailProvider({ apiKey: 'key', endpoint: 'https://example.com', fetcher });
        await expect(
            provider.sendEmail({ to: 'user@example.com', subject: 'Hello', content: 'body', isHtml: true }),
        ).rejects.toThrow('bad request');
    });
});
