import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import type { ChecklistInstanceStatus } from '@/server/types/onboarding-types';

export type OffboardingStatusVariant = 'default' | 'secondary' | 'outline';

export function formatOffboardingStatus(
    status: OffboardingRecord['status'],
): string {
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

export function resolveOffboardingStatusVariant(
    status: OffboardingRecord['status'],
): OffboardingStatusVariant {
    if (status === 'COMPLETED') {
        return 'default';
    }
    if (status === 'CANCELLED') {
        return 'outline';
    }
    return 'secondary';
}

export function formatChecklistStatus(
    status: ChecklistInstanceStatus | null,
): string {
    if (!status) {
        return 'Not started';
    }
    if (status === 'IN_PROGRESS') {
        return 'In progress';
    }
    if (status === 'COMPLETED') {
        return 'Completed';
    }
    return 'Cancelled';
}

export function formatChecklistProgressLabel(
    completed: number,
    total: number,
): string {
    return `${String(completed)} / ${String(total)}`;
}
