import type { LeaveRequest } from '@/server/types/leave-types';

export type UkJurisdiction = 'england-wales' | 'scotland' | 'northern-ireland';

export interface PolicyCheckInput {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    existingRequests: LeaveRequest[];
    today?: Date;
    jurisdiction?: UkJurisdiction;
    bankHolidays?: string[];
    overrides?: Partial<UkPolicyDefaults>;
}

export interface PolicyIssue {
    code: 'notice' | 'overlap' | 'bank-holiday' | 'max-span' | 'invalid-range';
    message: string;
    field?: 'startDate' | 'endDate' | 'totalDays';
}

export interface PolicyCheckResult {
    blocking: PolicyIssue[];
    warnings: PolicyIssue[];
}

interface UkPolicyDefaults {
    maxConsecutiveDays: number;
    noticeMultiplier: number; // UK statutory guidance: give notice at least twice the length of leave
}

const DEFAULT_JURISDICTION: UkJurisdiction = 'england-wales';
const SCOTLAND: UkJurisdiction = 'scotland';
const NORTHERN_IRELAND: UkJurisdiction = 'northern-ireland';
const FIELD_START_DATE: PolicyIssue['field'] = 'startDate';
const FIELD_END_DATE: PolicyIssue['field'] = 'endDate';

const defaultPolicy: UkPolicyDefaults = {
    maxConsecutiveDays: 28,
    noticeMultiplier: 2,
};

const staticEnglandWales = [
    // 2025
    '2025-01-01', '2025-04-18', '2025-04-21', '2025-05-05', '2025-05-26', '2025-08-25', '2025-12-25', '2025-12-26',
    // 2026
    '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25', '2026-08-31', '2026-12-25', '2026-12-28',
    // 2027
    '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31', '2027-08-30', '2027-12-27', '2027-12-28',
    // 2028 (partial forward coverage)
    '2028-01-03', '2028-04-14', '2028-04-17', '2028-05-01', '2028-05-29', '2028-08-28', '2028-12-25', '2028-12-26',
];

const staticScotlandExtras = ['2025-01-02', '2026-01-02', '2027-01-04', '2028-01-02'];
const staticNorthernIrelandExtras = ['2025-03-17', '2025-07-14', '2026-03-17', '2026-07-13', '2027-03-17', '2027-07-12', '2028-03-17', '2028-07-12'];

const bankHolidayCache = new Map<string, { expires: number; dates: string[] }>();

function startOfDay(value: Date): Date {
    const copy = new Date(value);
    copy.setUTCHours(0, 0, 0, 0);
    return copy;
}

function diffInDays(from: Date, to: Date): number {
    const msPerDay = 86_400_000;
    return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart <= bEnd && bStart <= aEnd;
}

function formatNumber(value: number): string {
    return value.toLocaleString('en-GB');
}

function baseHolidaysFor(jurisdiction: UkJurisdiction | undefined): string[] {
    const key = jurisdiction ?? DEFAULT_JURISDICTION;
    if (key === SCOTLAND) {
        return [...staticEnglandWales, ...staticScotlandExtras];
    }
    if (key === NORTHERN_IRELAND) {
        return [...staticEnglandWales, ...staticNorthernIrelandExtras];
    }
    return staticEnglandWales;
}

function resolvePolicyDefaults(overrides?: Partial<UkPolicyDefaults>): UkPolicyDefaults {
    return {
        maxConsecutiveDays: overrides?.maxConsecutiveDays ?? defaultPolicy.maxConsecutiveDays,
        noticeMultiplier: overrides?.noticeMultiplier ?? defaultPolicy.noticeMultiplier,
    };
}

function parseGovUkResponse(json: unknown, jurisdiction: UkJurisdiction): string[] {
    if (!json || typeof json !== 'object') {
        return [];
    }
    const record = json as Record<string, unknown>;
    const divisionKey = jurisdiction === 'scotland'
        ? SCOTLAND
        : jurisdiction === NORTHERN_IRELAND
            ? NORTHERN_IRELAND
            : 'england-and-wales';
    const division = record[divisionKey];
    if (!division || typeof division !== 'object') {
        return [];
    }
    const events = (division as { events?: unknown }).events;
    if (!Array.isArray(events)) {
        return [];
    }
    return events
        .map((event_) => (event_ && typeof event_ === 'object' ? (event_ as Record<string, unknown>).date : undefined))
        .filter((value): value is string => typeof value === 'string');
}

export async function loadUkBankHolidays(input?: { jurisdiction?: UkJurisdiction; ttlMs?: number; signal?: AbortSignal }): Promise<string[]> {
    const jurisdiction = input?.jurisdiction ?? DEFAULT_JURISDICTION;
    const cacheKey = jurisdiction;
    const now = Date.now();
    const ttlMs = input?.ttlMs ?? 86_400_000; // 24h
    const cached = bankHolidayCache.get(cacheKey);
    if (cached && cached.expires > now) {
        return cached.dates;
    }

    try {
        const response = await fetch('https://www.gov.uk/bank-holidays.json', { signal: input?.signal, cache: 'no-store' });
        if (response.ok) {
            const json: unknown = await response.json();
            const dates = parseGovUkResponse(json, jurisdiction);
            if (dates.length > 0) {
                bankHolidayCache.set(cacheKey, { expires: now + ttlMs, dates });
                return dates;
            }
        }
    } catch {
        // Silent fallback to static list to avoid user-visible failures
    }

    const fallback = baseHolidaysFor(jurisdiction);
    bankHolidayCache.set(cacheKey, { expires: now + ttlMs, dates: fallback });
    return fallback;
}

export function checkUkDefaultLeavePolicy(input: PolicyCheckInput): PolicyCheckResult {
    const blocking: PolicyIssue[] = [];
    const warnings: PolicyIssue[] = [];

    const policy = resolvePolicyDefaults(input.overrides);
    const today = startOfDay(input.today ?? new Date());
    const start = startOfDay(input.startDate);
    const end = startOfDay(input.endDate);

    if (end < start) {
        blocking.push({ code: 'invalid-range', message: 'End date must be on or after the start date.', field: FIELD_END_DATE });
        return { blocking, warnings };
    }

    const inclusiveSpan = diffInDays(start, end) + 1;
    if (inclusiveSpan > policy.maxConsecutiveDays) {
        blocking.push({
            code: 'max-span',
            message: `UK default policy caps a single request at ${formatNumber(policy.maxConsecutiveDays)} consecutive days.`,
            field: FIELD_END_DATE,
        });
    }

    const noticeDaysRequired = Math.ceil(input.totalDays * policy.noticeMultiplier);
    const noticeDaysAvailable = diffInDays(today, start);
    if (noticeDaysAvailable < noticeDaysRequired) {
        blocking.push({
            code: 'notice',
            message: `UK guidance expects at least ${formatNumber(noticeDaysRequired)} days notice for ${formatNumber(input.totalDays)} day(s) of leave.`,
            field: FIELD_START_DATE,
        });
    }

    const holidays = input.bankHolidays && input.bankHolidays.length > 0
        ? input.bankHolidays
        : baseHolidaysFor(input.jurisdiction);
    const bankHolidaySet = new Set(holidays);
    const bankHolidayHits: string[] = [];
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        const iso = cursor.toISOString().slice(0, 10);
        if (bankHolidaySet.has(iso)) {
            bankHolidayHits.push(iso);
        }
    }
    if (bankHolidayHits.length > 0) {
        warnings.push({
            code: 'bank-holiday',
            message: `The request spans UK bank holiday(s): ${bankHolidayHits.join(', ')}. Employer approval may be required.`,
        });
    }

    const overlapStatuses = new Set(['submitted', 'approved']);
    const overlappingRequests = input.existingRequests.filter((request) => {
        if (!overlapStatuses.has(request.status)) {
            return false;
        }
        const reqStart = startOfDay(new Date(request.startDate));
        const reqEnd = startOfDay(new Date(request.endDate));
        return overlaps(start, end, reqStart, reqEnd);
    });

    if (overlappingRequests.length > 0) {
        const ids = overlappingRequests.map((r) => r.id).join(', ');
        blocking.push({
            code: 'overlap',
            message: `This request overlaps with existing submitted/approved requests (${ids}).`,
            field: FIELD_START_DATE,
        });
    }

    return { blocking, warnings };
}
