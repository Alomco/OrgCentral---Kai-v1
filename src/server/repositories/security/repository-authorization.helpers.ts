import type { OrgPermissionMap } from '@/server/security/access-control';
import { RepositoryAuthorizationError } from './repository-errors';

export const DEFAULT_AUTHORIZATION_FAILED_MESSAGE = 'Authorization failed.';

type UnknownError = unknown;

type PermissionList = readonly string[] | undefined;

export function mergePermissionMaps(
    base: Readonly<OrgPermissionMap> | undefined,
    override: OrgPermissionMap | undefined,
): OrgPermissionMap | undefined {
    if (!base && !override) {
        return undefined;
    }
    const result: OrgPermissionMap = {};
    const resources = new Set<string>([...Object.keys(base ?? {}), ...Object.keys(override ?? {})]);
    for (const resource of resources) {
        const baseActions = base?.[resource] ?? [];
        const overrideActions = override?.[resource] ?? [];
        const merged = mergeUnique(baseActions, overrideActions);
        if (merged.length > 0) {
            result[resource] = merged;
        }
    }
    return Object.keys(result).length ? result : undefined;
}

export function toRepositoryAuthorizationError(error: UnknownError): RepositoryAuthorizationError {
    if (error instanceof RepositoryAuthorizationError) {
        return error;
    }

    const normalized = normalizeAuthorizationError(error);
    return new RepositoryAuthorizationError(normalized.message, { cause: normalized.cause });
}

function mergeUnique(base: PermissionList, override: PermissionList): string[] {
    const combined = new Set<string>([...(base ?? []), ...(override ?? [])]);
    return Array.from(combined);
}

function normalizeAuthorizationError(error: UnknownError): { message: string; cause: UnknownError } {
    if (error instanceof Error) {
        const causeText = truncate(describeUnknownError((error as { cause?: UnknownError }).cause));

        let message = error.message || error.name || DEFAULT_AUTHORIZATION_FAILED_MESSAGE;

        if (causeText && message.includes('[object Object]')) {
            message = message.replace('[object Object]', causeText);
        }

        if (causeText && message.trim().length > 0 && message.trim() !== causeText) {
            const lower = message.toLowerCase();
            const looksGeneric =
                lower === 'unknown error' ||
                lower.startsWith('unknown error:') ||
                lower === DEFAULT_AUTHORIZATION_FAILED_MESSAGE.toLowerCase() ||
                lower === 'authorization failed';

            if (looksGeneric) {
                message = `Authorization failed: ${causeText}`;
            }
        }

        return { message: message || DEFAULT_AUTHORIZATION_FAILED_MESSAGE, cause: error };
    }

    const described = truncate(describeUnknownError(error));
    return {
        message: described ? `Authorization failed: ${described}` : DEFAULT_AUTHORIZATION_FAILED_MESSAGE,
        cause: error,
    };
}

function truncate(value: string | undefined, maxLength = 600): string | undefined {
    if (!value) {
        return undefined;
    }
    const text = value.trim();
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.slice(0, maxLength)}...`;
}

function describeUnknownError(value: UnknownError): string | undefined {
    if (typeof value === 'string') {
        return value.trim().length > 0 ? value : undefined;
    }

    if (value instanceof Error) {
        const message = value.message.trim();
        return message.length > 0 ? message : value.name;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }

    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const record = value as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim().length > 0) {
        return record.message;
    }
    if (typeof record.error === 'string' && record.error.trim().length > 0) {
        return record.error;
    }
    if (typeof record.code === 'string' && record.code.trim().length > 0) {
        const code = record.code.trim();
        const message = typeof record.message === 'string' ? record.message.trim() : '';
        return message.length > 0 ? `${code}: ${message}` : code;
    }

    const json = safeJsonStringify(value);
    if (json && json !== '{}' && json !== '[]') {
        return json;
    }

    return undefined;
}

function safeJsonStringify(value: UnknownError): string | undefined {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const seen = new WeakSet<object>();
    try {
        return JSON.stringify(value, (_key, value_) => {
            if (typeof value_ === 'bigint') {
                return value_.toString();
            }
            if (typeof value_ === 'object' && value_ !== null) {
                const objectValue = value_ as object;
                if (seen.has(objectValue)) {
                    return '[Circular]';
                }
                seen.add(objectValue);
            }
            return value_ as string | number | boolean | null | object;
        });
    } catch {
        return undefined;
    }
}
