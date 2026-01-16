import type { UnplannedAbsence } from '@/server/types/hr-ops-types';

export interface AbsenceRequestSummary {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
}

export function filterPendingAbsenceRequests(absences: UnplannedAbsence[]): UnplannedAbsence[] {
    return absences.filter((absence) => absence.status === 'REPORTED');
}

export function buildAbsenceRequestSummary(absences: UnplannedAbsence[]): AbsenceRequestSummary {
    return absences.reduce<AbsenceRequestSummary>(
        (summary, absence) => {
            summary.total += 1;
            if (absence.status === 'REPORTED') {
                summary.pending += 1;
            } else if (absence.status === 'APPROVED') {
                summary.approved += 1;
            } else if (absence.status === 'REJECTED') {
                summary.rejected += 1;
            } else if (absence.status === 'CANCELLED') {
                summary.cancelled += 1;
            }
            return summary;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    );
}
