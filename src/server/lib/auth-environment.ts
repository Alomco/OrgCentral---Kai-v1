export function resolveAuthBaseURL(): string {
    return (
        process.env.AUTH_BASE_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        'http://localhost:3000'
    );
}

export function isAuthSyncEnabled(): boolean {
    return Boolean(process.env.BULLMQ_REDIS_URL ?? process.env.REDIS_URL);
}
