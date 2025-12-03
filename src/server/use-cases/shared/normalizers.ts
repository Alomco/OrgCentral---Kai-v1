/**
 * Shared normalization utilities for use-cases.
 * Ensures consistent data transformation across the application.
 */

/**
 * Normalizes Headers or HeadersInit to a Headers instance.
 */
export function normalizeHeaders(headers: Headers | HeadersInit): Headers {
    if (headers instanceof Headers) {
        return headers;
    }
    return new Headers(headers);
}

/**
 * Normalizes an actor object with userId and email.
 */
export interface NormalizedActor {
    userId: string;
    email: string;
}

export function normalizeActor(actor: {
    userId?: string;
    email?: string;
}): NormalizedActor {
    const userId = actor.userId?.trim();
    const email = actor.email?.trim().toLowerCase();

    if (!userId) {
        throw new Error('User ID is required.');
    }
    if (!email) {
        throw new Error('User email is required.');
    }

    return { userId, email };
}

/**
 * Normalizes employment type string to standard enum format.
 */
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'INTERN';

export function normalizeEmploymentType(value: string | undefined): EmploymentType | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.replace(/[-\s]/g, '_').toUpperCase();
    const allowed = new Set<EmploymentType>(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']);
    return allowed.has(normalized as EmploymentType)
        ? (normalized as EmploymentType)
        : undefined;
}

/**
 * Normalizes a role or roles array, ensuring deduplication and filtering empty strings.
 */
export function normalizeRoles(roles: string | string[] | undefined): string[] {
    if (!roles) {
        return ['member'];
    }
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const filtered = rolesArray
        .filter((role) => typeof role === 'string' && role.trim().length > 0)
        .map((role) => role.trim());

    return filtered.length > 0 ? Array.from(new Set(filtered)) : ['member'];
}

/**
 * Normalizes an email address to lowercase.
 */
export function normalizeEmail(email: string | undefined): string | undefined {
    return email?.trim().toLowerCase();
}

/**
 * Normalizes a string by trimming whitespace.
 */
export function normalizeString(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Normalizes a token by trimming whitespace.
 */
export function normalizeToken(token: string | undefined): string {
    const trimmed = token?.trim();
    if (!trimmed) {
        throw new Error('Token is required.');
    }
    return trimmed;
}
