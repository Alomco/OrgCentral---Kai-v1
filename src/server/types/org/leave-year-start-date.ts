export type LeaveYearStartDate = string & { readonly __brand: unique symbol };

/**
 * Normalizes legacy leave year start date input to an MM-DD string.
 * Accepts:
 * - MM-DD
 * - YYYY-MM-DD (converted to MM-DD)
 */
export function normalizeLeaveYearStartDate(value: string): LeaveYearStartDate {
    const trimmed = value.trim();
    if (/^\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed as LeaveYearStartDate;
    }

    const isoMatch = /^\d{4}-(\d{2})-(\d{2})$/.exec(trimmed);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}` as LeaveYearStartDate;
    }

    throw new Error('leaveYearStartDate must be MM-DD or ISO date (YYYY-MM-DD)');
}
