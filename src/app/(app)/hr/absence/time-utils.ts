export function parseTimeToMinutes(value: string): number | null {
    const [hourPart, minutePart] = value.split(':');
    const hours = Number(hourPart);
    const minutes = Number(minutePart);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return null;
    }
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }
    return hours * 60 + minutes;
}

export function roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
}
