export async function readJson<T = unknown>(request: Request): Promise<T | Record<string, never>> {
    const rawBody = await request.text();
    if (rawBody.trim().length === 0) {
        return {};
    }

    try {
        return JSON.parse(rawBody) as T;
    } catch {
        throw new SyntaxError('Request body must be valid JSON.');
    }
}
