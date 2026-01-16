import { describe, expect, it } from 'vitest';

import { buildAbsenceRequestSummary, filterPendingAbsenceRequests } from '@/app/(app)/hr/absence/requests/absence-request-utils';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';

function buildAbsence(status: UnplannedAbsence['status']): UnplannedAbsence {
    return {
        id: `absence-${status}`,
        orgId: 'org-1',
        userId: 'user-1',
        typeId: 'SICK',
        startDate: new Date('2025-01-02'),
        endDate: new Date('2025-01-03'),
        hours: 8,
        status,
        dataClassification: 'OFFICIAL',
        residencyTag: 'UK_ONLY',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
    };
}

describe('absence request utils', () => {
    it('filters pending absence requests', () => {
        const absences = [
            buildAbsence('REPORTED'),
            buildAbsence('APPROVED'),
            buildAbsence('REPORTED'),
        ];

        const pending = filterPendingAbsenceRequests(absences);
        expect(pending).toHaveLength(2);
        expect(pending.every((absence) => absence.status === 'REPORTED')).toBe(true);
    });

    it('summarizes absence request statuses', () => {
        const absences = [
            buildAbsence('REPORTED'),
            buildAbsence('APPROVED'),
            buildAbsence('REJECTED'),
            buildAbsence('CANCELLED'),
        ];

        const summary = buildAbsenceRequestSummary(absences);
        expect(summary.total).toBe(4);
        expect(summary.pending).toBe(1);
        expect(summary.approved).toBe(1);
        expect(summary.rejected).toBe(1);
        expect(summary.cancelled).toBe(1);
    });

    it('handles empty absence summaries', () => {
        const summary = buildAbsenceRequestSummary([]);
        expect(summary).toEqual({
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0,
        });
    });
});
