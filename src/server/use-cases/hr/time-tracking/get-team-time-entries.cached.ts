import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';
import { registerTimeEntryCache } from './cache-helpers';
import {
    resolveTimeEntryHours,
    resolveTimeEntryProfileName,
} from './team-entry-helpers';

export interface TeamTimeEntry {
    id: string;
    employeeName: string;
    userId: string;
    date: Date;
    clockIn: Date;
    clockOut?: Date | null;
    totalHours?: number | null;
    project?: string | null;
    status: TimeEntry['status'];
}

export interface GetTeamTimeEntriesForUiInput {
    authorization: RepositoryAuthorizationContext;
}

const TEAM_WINDOW_DAYS = 30;

export async function getTeamTimeEntriesForUi(
    input: GetTeamTimeEntriesForUiInput,
): Promise<TeamTimeEntry[]> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.TIME_ENTRY,
        payload: {
            view: 'team',
            windowDays: TEAM_WINDOW_DAYS,
        },
    });

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return loadTeamTimeEntries(input.authorization);
    }

    return getTeamTimeEntriesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}

async function getTeamTimeEntriesCached(
    cachedInput: GetTeamTimeEntriesForUiInput,
): Promise<TeamTimeEntry[]> {
    'use cache';
    cacheLife(CACHE_LIFE_SHORT);

    registerTimeEntryCache(cachedInput.authorization);

    return loadTeamTimeEntries(cachedInput.authorization);
}

async function loadTeamTimeEntries(
    authorization: RepositoryAuthorizationContext,
): Promise<TeamTimeEntry[]> {
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

    const from = new Date();
    from.setDate(from.getDate() - TEAM_WINDOW_DAYS);

    const timeTrackingService = getTimeTrackingService();
    const entriesResult = await timeTrackingService.listTimeEntries({
        authorization,
        filters: { from },
    });

    return entriesResult.entries
        .filter((entry) => profileByUserId.has(entry.userId))
        .map((entry) => {
            const profile = profileByUserId.get(entry.userId);
            const name = resolveTimeEntryProfileName(profile);

            return {
                id: entry.id,
                employeeName: name,
                userId: entry.userId,
                date: entry.date,
                clockIn: entry.clockIn,
                clockOut: entry.clockOut,
                totalHours: resolveTimeEntryHours(entry.totalHours),
                project: entry.project,
                status: entry.status,
            };
        });
}
