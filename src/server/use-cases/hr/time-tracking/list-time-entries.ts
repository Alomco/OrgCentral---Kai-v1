import { AuthorizationError, ValidationError } from '@/server/errors';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { canViewOrgTimeEntries } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import type { TimeEntryFilters } from '@/server/types/hr-time-tracking-schemas';
import { registerTimeEntryCache } from './cache-helpers';

// Use-case: list time entries for an organization using time-tracking repositories with filters.

export interface ListTimeEntriesDependencies {
    timeEntryRepository: ITimeEntryRepository;
}

export interface ListTimeEntriesInput {
    authorization: RepositoryAuthorizationContext;
    filters?: TimeEntryFilters;
}

export interface ListTimeEntriesResult {
    entries: TimeEntry[];
}

type RepositoryTimeEntryFilters = NonNullable<Parameters<ITimeEntryRepository['listTimeEntries']>[1]>;

export async function listTimeEntries(
    deps: ListTimeEntriesDependencies,
    input: ListTimeEntriesInput,
): Promise<ListTimeEntriesResult> {
    const normalizedFilters = normalizeFilters(input.filters);
    const scopedFilters = scopeFilters(input.authorization, normalizedFilters);

    if (input.authorization.dataClassification === 'OFFICIAL') {
        registerTimeEntryCache(input.authorization);
    }

    const entries = await deps.timeEntryRepository.listTimeEntries(
        input.authorization.orgId,
        scopedFilters,
    );

    return { entries: enforceTenantVisibility(input.authorization, entries) };
}

function normalizeFilters(filters?: TimeEntryFilters): RepositoryTimeEntryFilters {
    if (!filters) {
        return {};
    }

    const userId = filters.userId?.trim();
    const normalized: RepositoryTimeEntryFilters = {
        userId: userId && userId.length > 0 ? userId : undefined,
        status: filters.status,
        from: coerceDate(filters.from, 'from'),
        to: coerceDate(filters.to, 'to'),
    };

    if (normalized.from && normalized.to && normalized.from > normalized.to) {
        throw new ValidationError('The "from" date must be before the "to" date.');
    }

    return normalized;
}

function coerceDate(value: Date | undefined, field: 'from' | 'to'): Date | undefined {
    if (!value) {
        return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ValidationError(`Invalid ${field} date.`);
    }
    return date;
}

function scopeFilters(
    authorization: RepositoryAuthorizationContext,
    filters: RepositoryTimeEntryFilters,
): RepositoryTimeEntryFilters {
    const requestedUserId = filters.userId;

    if (!requestedUserId && !canViewOrgTimeEntries(authorization)) {
        return { ...filters, userId: authorization.userId };
    }

    if (
        requestedUserId &&
        requestedUserId !== authorization.userId &&
        !canViewOrgTimeEntries(authorization)
    ) {
        throw new AuthorizationError('You cannot view time entries for other members.');
    }

    return filters;
}

function enforceTenantVisibility(
    authorization: RepositoryAuthorizationContext,
    entries: TimeEntry[],
): TimeEntry[] {
    if (canViewOrgTimeEntries(authorization)) {
        return entries;
    }

    const scoped = entries.filter((entry) => entry.userId === authorization.userId);
    if (scoped.length !== entries.length) {
        throw new AuthorizationError('Filtered results contained entries outside your scope.');
    }

    return scoped;
}
