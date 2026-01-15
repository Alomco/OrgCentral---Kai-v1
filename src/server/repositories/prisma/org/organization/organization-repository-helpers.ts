import type { LeaveYearStartDate } from '@/server/types/org/organization-settings';
import { PrismaTypes, type PrismaInputJsonValue } from '@/server/types/prisma';
import { toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';

export function parseMonthDayToAnchorDate(value: LeaveYearStartDate): Date {
    const match = /^\d{2}-\d{2}$/.exec(value);
    if (!match) {
        throw new Error('leaveYearStartDate must be MM-DD');
    }

    // Anchor year is arbitrary; we only care about month/day. Use UTC to avoid timezone drift.
    return new Date(`2000-${value}T00:00:00.000Z`);
}

export function normalizeLeaveRoundingRule(value: string): string {
    if (value === 'nearest_half') {
        return 'half_day';
    }
    if (value === 'round_up') {
        return 'full_day';
    }
    return value;
}

export function parseIncorporationDate(value: string): Date | null {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toJsonNullInput(
    value: Parameters<typeof toPrismaInputJson>[0],
): PrismaInputJsonValue | typeof PrismaTypes.JsonNull | undefined {
    const resolved = toPrismaInputJson(value);
    if (resolved === PrismaTypes.DbNull) {
        return PrismaTypes.JsonNull;
    }
    return resolved as PrismaInputJsonValue | typeof PrismaTypes.JsonNull | undefined;
}
