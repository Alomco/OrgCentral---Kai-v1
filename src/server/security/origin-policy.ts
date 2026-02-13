function normalizeOriginValue(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

function appendConfiguredOrigins(allowed: Set<string>): boolean {
    let hasConfiguredOrigins = false;

    const configuredOrigins = [
        process.env.APP_BASE_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.AUTH_BASE_URL,
    ];

    for (const value of configuredOrigins) {
        const origin = normalizeOriginValue(value);
        if (origin) {
            allowed.add(origin);
            hasConfiguredOrigins = true;
        }
    }

    const overrideList = process.env.SECURITY_CSRF_ALLOWED_ORIGINS;
    if (overrideList) {
        for (const entry of overrideList.split(',')) {
            const origin = normalizeOriginValue(entry.trim());
            if (origin) {
                allowed.add(origin);
                hasConfiguredOrigins = true;
            }
        }
    }

    return hasConfiguredOrigins;
}

export function normalizeOrigin(value: string | null | undefined): string | null {
    return normalizeOriginValue(value);
}

export function resolveMutationOrigin(headers: Headers | HeadersInit): string | null {
    const normalizedHeaders = headers instanceof Headers ? headers : new Headers(headers);
    return normalizeOriginValue(normalizedHeaders.get('origin'))
        ?? normalizeOriginValue(normalizedHeaders.get('referer'));
}

export function buildAllowedMutationOrigins(input: {
    headers?: Headers | HeadersInit;
    request?: Request;
}): string[] {
    const allowed = new Set<string>();
    const hasConfiguredOrigins = appendConfiguredOrigins(allowed);

    if (!hasConfiguredOrigins && process.env.NODE_ENV !== 'production') {
        if (input.request) {
            allowed.add(new URL(input.request.url).origin);
        } else if (input.headers) {
            const headers = input.headers instanceof Headers ? input.headers : new Headers(input.headers);
            const host = headers.get('x-forwarded-host') ?? headers.get('host');
            const protocol = headers.get('x-forwarded-proto') ?? 'http';
            if (host) {
                allowed.add(`${protocol}://${host}`);
            }
        }
    }

    return Array.from(allowed);
}

export function isTrustedMutationOrigin(origin: string | null, allowedOrigins: readonly string[]): boolean {
    return Boolean(origin && allowedOrigins.includes(origin));
}
