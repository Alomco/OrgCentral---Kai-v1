export function normalizeDate(value?: Date | string | number): Date | undefined {
    if (!value) {
        return undefined;
    }
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'number') {
        const fromNumber = new Date(value);
        return Number.isNaN(fromNumber.getTime()) ? undefined : fromNumber;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    return parsed;
}

export function resolveDefaultLeaveTypes(
    entitlements: Map<string, number>,
    primaryLeaveType?: string,
): string[] {
    const derived = new Set<string>();
    for (const key of entitlements.keys()) {
        if (key.trim().length > 0) {
            derived.add(key);
        }
    }
    if (primaryLeaveType) {
        derived.add(primaryLeaveType);
    }
    if (derived.size === 0) {
        derived.add('annual');
    }
    return Array.from(derived);
}

export function buildNormalizedSet(values?: string[]): Set<string> | undefined {
    if (!values || values.length === 0) {
        return undefined;
    }
    return new Set(values.map((value) => normalizeLeaveType(value)).filter((value) => value.length > 0));
}

export function buildEntitlementMap(source?: Record<string, number>): Map<string, number> {
    const map = new Map<string, number>();
    if (!source) {
        return map;
    }
    for (const [key, value] of Object.entries(source)) {
        const normalized = normalizeLeaveType(key);
        if (!normalized) {
            continue;
        }
        const parsed = toNumber(value, 0);
        map.set(normalized, parsed);
    }
    return map;
}

export function normalizeLeaveType(value: string): string {
    return value.trim().toLowerCase();
}

export function normalizeEmployeeNumber(value: string): string {
    return value.trim().toLowerCase();
}

export function toNumber(value: unknown, defaultValue: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
}
