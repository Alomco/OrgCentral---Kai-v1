import type { Prisma } from '@prisma/client';

export type TimeEntryDecisionStatus = 'APPROVED' | 'REJECTED';

export interface TimeEntryDecisionLog {
    status: TimeEntryDecisionStatus;
    decidedAt: string;
    decidedByOrgId: string;
    decidedByUserId: string;
    comments?: string | null;
}

export type TimeEntryMetadata = Record<string, unknown> & {
    decisionHistory?: TimeEntryDecisionLog[];
};

export function roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
}

export function calculateTotalHours(
    clockIn: Date,
    clockOut: Date,
    breakDurationHours: number | null | undefined,
): number {
    const durationMs = clockOut.getTime() - clockIn.getTime();
    const shiftHours = durationMs > 0 ? durationMs / 1000 / 60 / 60 : 0;
    const breakHours = typeof breakDurationHours === 'number' ? Math.max(0, breakDurationHours) : 0;
    return roundToTwoDecimals(Math.max(0, shiftHours - breakHours));
}

export function coerceTimeEntryMetadata(
    value: Prisma.JsonValue | null | undefined,
): TimeEntryMetadata {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    return { ...(value as Record<string, unknown>) } as TimeEntryMetadata;
}

export function mutateTimeEntryMetadata(
    value: Prisma.JsonValue | null | undefined,
    updater: (metadata: TimeEntryMetadata) => void,
): Prisma.JsonValue {
    const metadata = coerceTimeEntryMetadata(value);
    updater(metadata);
    return metadata as Prisma.JsonValue;
}

export function mergeMetadata(target: TimeEntryMetadata, extra: unknown): void {
    if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
        return;
    }
    Object.assign(target, extra as Record<string, unknown>);
}

export function appendDecision(
    value: Prisma.JsonValue | null | undefined,
    decision: TimeEntryDecisionLog,
    extra?: unknown,
): Prisma.JsonValue {
    return mutateTimeEntryMetadata(value, (metadata) => {
        mergeMetadata(metadata, extra);
        const history = Array.isArray(metadata.decisionHistory)
            ? metadata.decisionHistory.slice()
            : [];
        history.push(decision);
        metadata.decisionHistory = history;
    });
}

