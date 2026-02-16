import { expect } from 'vitest';

export function buildRequest(url: string, method: string, body?: unknown): Request {
    return new Request(url, {
        method,
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

export async function expectErrorCode(response: Response, status: number, code: string): Promise<void> {
    const payload = await response.json();
    expect(response.status).toBe(status);
    expect(payload).toEqual(
        expect.objectContaining({
            error: expect.objectContaining({
                code,
            }),
        }),
    );
}

export async function expectNoStoreJsonResponse<TPayload>(
    response: Response,
    status: number,
    expectedPayload: TPayload,
): Promise<void> {
    const payload = await response.json();
    expect(response.status).toBe(status);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(payload).toEqual(expectedPayload);
}
