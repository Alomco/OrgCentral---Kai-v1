export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function coerceDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
}

export function coerceOptionalDate(value: Date | string | undefined): Date | undefined {
    if (value === undefined) {
        return undefined;
    }

    return coerceDate(value);
}

export function coerceOptionalNullableDate(
    value: Date | string | null | undefined,
): Date | null | undefined {
    if (value === undefined || value === null) {
        return value;
    }

    return coerceDate(value);
}
