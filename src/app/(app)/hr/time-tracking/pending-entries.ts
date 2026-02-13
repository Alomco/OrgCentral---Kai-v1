import { cache } from 'react';

import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    resolveTimeEntryHours,
    resolveTimeEntryProfileName,
} from '@/server/use-cases/hr/time-tracking/team-entry-helpers';

export interface PendingTimeEntry {
    id: string;
    employeeName: string;
    date: Date;
    clockIn: Date;
    clockOut?: Date | null;
    totalHours?: number | null;
    project?: string | null;
}

export const buildPendingTimeEntries = cache(async (
    authorization: RepositoryAuthorizationContext,
): Promise<PendingTimeEntry[]> => {
    const peopleService = getPeopleService();
    const profilesResult = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    });

    const directReports = profilesResult.profiles.filter(
        (profile) => profile.managerUserId === authorization.userId,
    );
    if (directReports.length === 0) {
        return [];
    }

    const profileByUserId = new Map(
        directReports.map((profile) => [profile.userId, profile]),
    );

    const timeTrackingService = getTimeTrackingService();
    const entriesResult = await timeTrackingService.listTimeEntries({
        authorization,
        filters: { status: 'COMPLETED' },
    });

    return entriesResult.entries
        .filter((entry) => profileByUserId.has(entry.userId))
        .map((entry) => {
            const profile = profileByUserId.get(entry.userId);
            const name = resolveTimeEntryProfileName(profile);

            return {
                id: entry.id,
                employeeName: name,
                date: entry.date,
                clockIn: entry.clockIn,
                clockOut: entry.clockOut,
                totalHours: resolveTimeEntryHours(entry.totalHours),
                project: entry.project,
            };
        });
});
