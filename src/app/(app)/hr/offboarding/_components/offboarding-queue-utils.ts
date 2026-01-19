import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import { OFFBOARDING_STATUS_VALUES } from '@/server/types/hr/offboarding-types';

export interface OffboardingQueueRow {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeNumber: string | null;
    status: OffboardingRecord['status'];
    startedAt: Date | string;
    completedAt?: Date | string | null;
    checklistProgress: { completed: number; total: number; percent: number } | null;
}

export interface OffboardingQueueStats {
    inProgress: number;
    completedLast30: number;
    overdue: number;
}

export function parseStatusFilter(
    value: string | string[] | undefined,
): OffboardingRecord['status'] | null {
    if (!value || Array.isArray(value)) {
        return null;
    }
    return OFFBOARDING_STATUS_VALUES.includes(value as OffboardingRecord['status'])
        ? (value as OffboardingRecord['status'])
        : null;
}

export function formatStatus(status: OffboardingRecord['status']): string {
    switch (status) {
        case 'IN_PROGRESS':
            return 'In progress';
        case 'COMPLETED':
            return 'Completed';
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return status;
    }
}

export function resolveStatusVariant(
    status: OffboardingRecord['status'],
): 'default' | 'secondary' | 'outline' {
    if (status === 'COMPLETED') {
        return 'default';
    }
    if (status === 'CANCELLED') {
        return 'outline';
    }
    return 'secondary';
}

export function formatChecklistProgressLabel(
    completed: number,
    total: number,
): string {
    return `${String(completed)} / ${String(total)}`;
}

export function buildQueueStats(records: OffboardingRecord[]): OffboardingQueueStats {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const inProgress = records.filter((record) => record.status === 'IN_PROGRESS').length;
    const completedLast30 = records.filter((record) => {
        if (record.status !== 'COMPLETED' || !record.completedAt) {
            return false;
        }
        const completedAt = record.completedAt instanceof Date
            ? record.completedAt.getTime()
            : new Date(record.completedAt).getTime();
        return now - completedAt <= thirtyDaysMs;
    }).length;

    const overdue = records.filter((record) => {
        if (record.status !== 'IN_PROGRESS') {
            return false;
        }
        const startedAt = record.startedAt instanceof Date
            ? record.startedAt.getTime()
            : new Date(record.startedAt).getTime();
        return now - startedAt > thirtyDaysMs;
    }).length;

    return { inProgress, completedLast30, overdue };
}
