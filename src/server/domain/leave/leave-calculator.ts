export const DEFAULT_WORKING_HOURS_PER_DAY = 8;

export interface LeaveCalculationConfig {
    hoursPerDay?: number;
}

export function calculateTotalDaysFromHours(
    hours: number,
    config?: LeaveCalculationConfig,
): number {
    const hoursPerDay = config?.hoursPerDay && config.hoursPerDay > 0
        ? config.hoursPerDay
        : DEFAULT_WORKING_HOURS_PER_DAY;

    return hours / hoursPerDay;
}
