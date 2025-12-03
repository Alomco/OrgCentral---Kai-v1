import type { AbsenceSettings } from '@/server/types/hr-ops-types';

const MS_IN_DAY = 86_400_000;
const DEFAULT_HOURS_PER_DAY = 8;

export interface AbsenceDurationInput {
    startDate: Date;
    endDate: Date;
    hoursOverride?: number | null;
    hoursPerDay: number;
}

export function calculateAbsenceHours(input: AbsenceDurationInput): number {
    const override = input.hoursOverride;
    if (typeof override === 'number' && Number.isFinite(override)) {
        if (override <= 0) {
            throw new Error('Requested hours must be positive.');
        }
        return roundToTwoDecimals(override);
    }

    const startUtc = Date.UTC(
        input.startDate.getFullYear(),
        input.startDate.getMonth(),
        input.startDate.getDate(),
    );
    const endUtc = Date.UTC(
        input.endDate.getFullYear(),
        input.endDate.getMonth(),
        input.endDate.getDate(),
    );
    const diffDays = Math.floor((endUtc - startUtc) / MS_IN_DAY) + 1;
    const totalHours = diffDays * input.hoursPerDay;
    if (!Number.isFinite(totalHours) || totalHours <= 0) {
        throw new Error('Calculated hours must be positive.');
    }
    return roundToTwoDecimals(totalHours);
}

export function resolveHoursPerDay(settings: AbsenceSettings | null): number {
    const candidate = settings?.hoursInWorkDay ?? DEFAULT_HOURS_PER_DAY;
    const numeric = typeof candidate === 'number' ? candidate : Number(candidate);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_HOURS_PER_DAY;
}

export function calculateDayPortion(hours: number, hoursPerDay: number): number {
    if (!Number.isFinite(hours) || hours <= 0) {
        throw new Error('Hours must be a positive number.');
    }
    if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0) {
        throw new Error('Hours per day must be positive.');
    }
    const portion = hours / hoursPerDay;
    if (!Number.isFinite(portion) || portion <= 0) {
        throw new Error('Unable to derive a valid day portion.');
    }
    return roundToTwoDecimals(portion);
}

function roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
}
