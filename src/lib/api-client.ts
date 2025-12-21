import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type { AppSessionSnapshot } from '@/types/app-context';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientOptions {
    baseUrl?: string;
    authToken?: string | null;
    orgId?: string | null;
    residency?: DataResidencyZone | null;
    classification?: DataClassificationLevel | null;
    headers?: Record<string, string | undefined>;
}

export interface ApiRequestOptions<TBody = unknown> {
    path: string;
    method?: HttpMethod;
    searchParams?: Record<string, string | number | boolean | undefined | null>;
    body?: TBody;
    headers?: Record<string, string | undefined>;
}

export class ApiError extends Error {
    status: number;
    payload: unknown;

    constructor(message: string, status: number, payload: unknown) {
        super(message);
        this.status = status;
        this.payload = payload;
    }
}

function safeJsonParse(input: string): unknown {
    try {
        return JSON.parse(input) as unknown;
    } catch {
        return null;
    }
}

export function createApiClient(clientOptions: ApiClientOptions = {}) {
    const {
        baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
        authToken,
        orgId,
        residency,
        classification,
        headers = {},
    } = clientOptions;

    async function request<TResponse = unknown, TBody = unknown>(
        options: ApiRequestOptions<TBody>,
    ): Promise<TResponse> {
        const url = buildUrl(baseUrl, options.path, options.searchParams);

        const mergedHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
            ...(options.headers ?? {}),
        };

        if (authToken) {
            mergedHeaders.Authorization = `Bearer ${authToken}`;
        }
        if (orgId) {
            mergedHeaders['x-org-id'] = orgId;
        }
        if (residency) {
            mergedHeaders['x-data-residency'] = residency;
        }
        if (classification) {
            mergedHeaders['x-data-classification'] = classification;
        }

        const init: RequestInit = {
            method: options.method ?? 'GET',
            headers: mergedHeaders,
        };

        if (options.body !== undefined && options.body !== null) {
            init.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, init);
        const contentType = response.headers.get('content-type');
        const rawBody = await response.text().catch(() => '');
        const payload: unknown =
            contentType?.includes('application/json') === true
                ? safeJsonParse(rawBody)
                : rawBody;

        if (!response.ok) {
            throw new ApiError(
                `API request failed with status ${String(response.status)}`,
                response.status,
                payload,
            );
        }

        return payload as TResponse;
    }

    return {
        get: <TResponse = unknown>(
            path: string,
            options?: Omit<ApiRequestOptions, 'path' | 'method'>,
        ) => request<TResponse>({ path, method: 'GET', ...(options ?? {}) }),
        post: <TResponse = unknown, TBody = unknown>(
            path: string,
            body?: TBody,
            options?: Omit<ApiRequestOptions<TBody>, 'path' | 'method' | 'body'>,
        ) => request<TResponse, TBody>({ path, method: 'POST', body, ...(options ?? {}) }),
        put: <TResponse = unknown, TBody = unknown>(
            path: string,
            body?: TBody,
            options?: Omit<ApiRequestOptions<TBody>, 'path' | 'method' | 'body'>,
        ) => request<TResponse, TBody>({ path, method: 'PUT', body, ...(options ?? {}) }),
        patch: <TResponse = unknown, TBody = unknown>(
            path: string,
            body?: TBody,
            options?: Omit<ApiRequestOptions<TBody>, 'path' | 'method' | 'body'>,
        ) => request<TResponse, TBody>({ path, method: 'PATCH', body, ...(options ?? {}) }),
        delete: <TResponse = unknown>(
            path: string,
            options?: Omit<ApiRequestOptions, 'path' | 'method'>,
        ) => request<TResponse>({ path, method: 'DELETE', ...(options ?? {}) }),
        request,
    };
}

export function createApiClientFromSession(session: AppSessionSnapshot | null, options?: ApiClientOptions) {
    return createApiClient({
        ...options,
        orgId: session?.orgId ?? options?.orgId ?? null,
        authToken: options?.authToken ?? null,
        residency:
            (session?.dataResidency as DataResidencyZone | undefined) ??
            options?.residency ??
            null,
        classification:
            (session?.dataClassification as DataClassificationLevel | undefined) ??
            options?.classification ??
            null,
    });
}

function buildUrl(baseUrl: string, path: string, searchParams?: ApiRequestOptions['searchParams']): string {
    const url = new URL(path, baseUrl || 'http://localhost');
    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }
            url.searchParams.set(key, String(value));
        });
    }
    // If baseUrl is empty, URL will have "http://localhost" origin, so strip it.
    if (!baseUrl) {
        return url.pathname + url.search;
    }
    return url.toString();
}
