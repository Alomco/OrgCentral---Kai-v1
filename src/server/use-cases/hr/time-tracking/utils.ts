import type { PrismaJsonValue } from '@/server/types/prisma';
import type { TimeEntryMetadataPatch } from '@/server/types/hr-time-tracking-schemas';

export type TimeEntryDecisionStatus = 'APPROVED' | 'REJECTED';

export interface TimeEntryDecisionLog {
    status: TimeEntryDecisionStatus;
    decidedAt: string;
    decidedByOrgId: string;
    decidedByUserId: string;
    comments?: string | null;
}

export type TimeEntryMetadata = {
    billable?: boolean | null;
    projectCode?: string | null;
    overtimeReason?: string | null;
    overtimeHours?: number | null;
    decisionHistory?: TimeEntryDecisionLog[];
} & Record<string, unknown>;

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
    value: PrismaJsonValue | null | undefined,
): TimeEntryMetadata {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    return { ...(value as Record<string, unknown>) } as TimeEntryMetadata;
}

export function mutateTimeEntryMetadata(
    value: PrismaJsonValue | null | undefined,
    updater: (metadata: TimeEntryMetadata) => void,
): PrismaJsonValue {
    const metadata = coerceTimeEntryMetadata(value);
    updater(metadata);
    return metadata as PrismaJsonValue;
}

export function mergeMetadata(
    target: TimeEntryMetadata,
    extra: TimeEntryMetadataPatch | null | undefined,
): void {
    if (!extra) {
        return;
    }

    if (
        Object.prototype.hasOwnProperty.call(extra, 'billable')
        && extra.billable !== undefined
    ) {
        target.billable = extra.billable;
    }

    if (
        Object.prototype.hasOwnProperty.call(extra, 'projectCode')
        && extra.projectCode !== undefined
    ) {
        target.projectCode = extra.projectCode;
    }

    if (
        Object.prototype.hasOwnProperty.call(extra, 'overtimeReason')
        && extra.overtimeReason !== undefined
    ) {
        target.overtimeReason = extra.overtimeReason;
    }

    if (
        Object.prototype.hasOwnProperty.call(extra, 'overtimeHours')
        && extra.overtimeHours !== undefined
    ) {
        target.overtimeHours = extra.overtimeHours;
    }
}

export function appendDecision(
    value: PrismaJsonValue | null | undefined,
    decision: TimeEntryDecisionLog,
    extra?: TimeEntryMetadataPatch | null,
): PrismaJsonValue {
    return mutateTimeEntryMetadata(value, (metadata) => {
        mergeMetadata(metadata, extra);
        const history = Array.isArray(metadata.decisionHistory)
            ? metadata.decisionHistory.slice()
            : [];
        history.push(decision);
        metadata.decisionHistory = history;
    });
}
