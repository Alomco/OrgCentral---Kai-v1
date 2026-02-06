import type { BillingCadence } from '@/server/services/billing/billing-preferences';

export function resolveInitialPostpaidBillingAt(
  now: Date,
  cadence: BillingCadence,
): Date {
  if (cadence === 'annual') {
    return addUtcYearsClamped(now, 1);
  }
  return addUtcMonthsClamped(now, 1);
}

export function toStripeTrialEndTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function addUtcMonthsClamped(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const maxDay = daysInUtcMonth(targetYear, targetMonth);
  const targetDay = Math.min(day, maxDay);

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

function addUtcYearsClamped(date: Date, years: number): Date {
  const targetYear = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const maxDay = daysInUtcMonth(targetYear, month);
  const targetDay = Math.min(date.getUTCDate(), maxDay);

  return new Date(
    Date.UTC(
      targetYear,
      month,
      targetDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
