import type { AbsenceMetadata } from '@/server/domain/absences/metadata';

export type AbsenceDurationType = 'DAYS' | 'HOURS';

export interface AbsenceDurationDisplay {
    durationType: AbsenceDurationType;
    label: string;
    timeRange?: string;
    dayCount: number;
    hours: number;
}

const MS_IN_DAY = 86_400_000;

function toUtcMidnight(date: Date): number {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function calculateDayCount(startDate: Date, endDate: Date): number {
    const startUtc = toUtcMidnight(startDate);
    const endUtc = toUtcMidnight(endDate);
    if (!Number.isFinite(startUtc) || !Number.isFinite(endUtc)) {
        return 0;
    }
    const diffDays = Math.floor((endUtc - startUtc) / MS_IN_DAY) + 1;
    return Math.max(0, diffDays);
}

function resolveDurationType(metadata: AbsenceMetadata): AbsenceDurationType {
    return metadata.durationType === 'HOURS' ? 'HOURS' : 'DAYS';
}

function formatHours(hours: number): string {
    const rounded = Math.round(hours * 100) / 100;
    const label = Number.isFinite(rounded) ? rounded : 0;
    return `${String(label)} hour${label === 1 ? '' : 's'}`;
}

function formatDays(dayCount: number): string {
    const count = Number.isFinite(dayCount) ? dayCount : 0;
    return `${String(count)} day${count === 1 ? '' : 's'}`;
}

function formatTimeRange(metadata: AbsenceMetadata): string | undefined {
    if (metadata.durationType !== 'HOURS') {
        return undefined;
    }
    const start = metadata.startTime?.trim();
    const end = metadata.endTime?.trim();
    if (!start || !end) {
        return undefined;
    }
    return `${start}–${end}`;
}

export function getAbsenceDurationDisplay(input: {
    metadata: AbsenceMetadata;
    startDate: Date;
    endDate: Date;
    hours: number;
}): AbsenceDurationDisplay {
    const dayCount = calculateDayCount(input.startDate, input.endDate);
    const durationType = resolveDurationType(input.metadata);
    const label = durationType === 'HOURS' ? formatHours(input.hours) : formatDays(dayCount);

    return {
        durationType,
        label,
        timeRange: formatTimeRange(input.metadata),
        dayCount,
        hours: input.hours,
    };
}
