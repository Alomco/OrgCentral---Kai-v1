/**
 * Shared parsing utilities for use-cases.
 * Ensures consistent data parsing and transformation across the application.
 */

/**
 * Parses a date from string or Date, returning undefined for invalid dates.
 */
export function parseDate(value: string | Date | undefined): Date | undefined {
    if (!value) {
        return undefined;
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Parses a date from string or Date, with a default value for invalid dates.
 */
export function parseDateWithDefault(
    value: string | Date | undefined,
    defaultValue: Date,
): Date {
    const parsed = parseDate(value);
    return parsed ?? defaultValue;
}

/**
 * Parses an ISO date string to Date.
 */
export function parseISODate(value: string | undefined): Date | undefined {
    if (!value?.trim()) {
        return undefined;
    }
    try {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
        return undefined;
    }
}

/**
 * Parses a number from string or number.
 */
export function parseNumber(value: string | number | undefined): number | undefined {
    if (value === undefined) {
        return undefined;
    }
    const result = typeof value === 'number' ? value : Number.parseFloat(value);
    return Number.isNaN(result) ? undefined : result;
}

/**
 * Parses an integer from string or number.
 */
export function parseInteger(value: string | number | undefined): number | undefined {
    if (value === undefined) {
        return undefined;
    }
    const result = typeof value === 'number' ? Math.floor(value) : Number.parseInt(value, 10);
    return Number.isNaN(result) ? undefined : result;
}

/**
 * Parses a boolean from string or boolean.
 */
export function parseBoolean(value: string | boolean | undefined): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
        return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
        return false;
    }
    return undefined;
}

/**
 * Parses JSON string to object, returning undefined for invalid JSON.
 */
export function parseJSON(value: string | undefined): unknown {
    if (!value?.trim()) {
        return undefined;
    }
    try {
        return JSON.parse(value) as unknown;
    } catch {
        return undefined;
    }
}

/**
 * Parses a comma-separated string into an array.
 */
export function parseCSV(value: string | undefined): string[] {
    if (!value?.trim()) {
        return [];
    }
    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}
