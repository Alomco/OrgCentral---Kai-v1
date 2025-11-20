const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export interface TimeEntry {
    userId: string;
    startedAt: Date;
    endedAt: Date;
    minutesWorked?: number;
}

export interface WorkingTimeAverage {
    userId: string;
    averageHours: number;
    windowStart: Date;
    windowEnd: Date;
}

export interface WorkingTimeAlert extends WorkingTimeAverage {
    thresholdHours: number;
}

export function calculateMinutes(entry: TimeEntry): number {
    if (typeof entry.minutesWorked === 'number') {
        return entry.minutesWorked;
    }
    const durationMs = entry.endedAt.getTime() - entry.startedAt.getTime();
    return Math.max(0, Math.round(durationMs / 1000 / 60));
}

function withinWindow(entry: TimeEntry, windowStart: Date, windowEnd: Date): boolean {
    return entry.startedAt >= windowStart && entry.endedAt <= windowEnd;
}

export function computeRollingAverages(
    entries: TimeEntry[],
    windowDays = 7,
    asOf: Date = new Date(),
): WorkingTimeAverage[] {
    const windowEnd = asOf;
    const windowStart = new Date(windowEnd.getTime() - windowDays * HOURS_PER_DAY * MINUTES_PER_HOUR * 60 * 1000);
    const perUser = new Map<string, number>();

    for (const entry of entries) {
        if (!withinWindow(entry, windowStart, windowEnd)) {
            continue;
        }
        const minutes = calculateMinutes(entry);
        perUser.set(entry.userId, (perUser.get(entry.userId) ?? 0) + minutes);
    }

    const result: WorkingTimeAverage[] = [];
    for (const [userId, totalMinutes] of perUser.entries()) {
        const averageHours = totalMinutes / MINUTES_PER_HOUR / windowDays;
        result.push({ userId, averageHours, windowStart, windowEnd });
    }
    return result;
}

export function detectWorkingTimeAlerts(
    entries: TimeEntry[],
    thresholdHours = 48,
    windowDays = 7,
    asOf: Date = new Date(),
): WorkingTimeAlert[] {
    const averages = computeRollingAverages(entries, windowDays, asOf);
    return averages
        .filter((avg) => avg.averageHours > thresholdHours)
        .map((avg) => ({
            ...avg,
            thresholdHours,
        }));
}

export async function runWorkingTimeCheck(
    entries: TimeEntry[],
    publishAlert: (alert: WorkingTimeAlert) => Promise<void>,
    thresholdHours = 48,
    windowDays = 7,
    asOf: Date = new Date(),
): Promise<void> {
    const alerts = detectWorkingTimeAlerts(entries, thresholdHours, windowDays, asOf);
    for (const alert of alerts) {
        await publishAlert(alert);
    }
}
