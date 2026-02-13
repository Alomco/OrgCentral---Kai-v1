export interface EmployeeProfileNameSource {
    displayName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export function resolveTimeEntryProfileName(
    profile?: EmployeeProfileNameSource,
): string {
    if (!profile) {
        return 'Employee';
    }

    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }

    const firstName = profile.firstName?.trim() ?? '';
    const lastName = profile.lastName?.trim() ?? '';
    const fallback = `${firstName} ${lastName}`.trim();
    return fallback.length > 0 ? fallback : 'Employee';
}

export function resolveTimeEntryHours(
    value: number | { toNumber?: () => number } | null | undefined,
): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'object' && typeof value.toNumber === 'function') {
        return value.toNumber();
    }
    return null;
}
