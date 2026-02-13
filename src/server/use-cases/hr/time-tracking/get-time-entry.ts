import { AuthorizationError } from '@/server/errors';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { canViewOrgTimeEntries } from '@/server/security/authorization';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import { registerTimeEntryCache } from './cache-helpers';

// Use-case: get a time entry by id through time-tracking repositories under tenant scope.

export interface GetTimeEntryDependencies {
    timeEntryRepository: ITimeEntryRepository;
}

export interface GetTimeEntryInput {
    authorization: RepositoryAuthorizationContext;
    entryId: string;
}

export interface GetTimeEntryResult {
    entry: TimeEntry | null;
}

export async function getTimeEntry(
    deps: GetTimeEntryDependencies,
    input: GetTimeEntryInput,
): Promise<GetTimeEntryResult> {
    const entry = await deps.timeEntryRepository.getTimeEntry(
        input.authorization.orgId,
        input.entryId,
    );

    registerTimeEntryCache(input.authorization);

    if (!entry) {
        return { entry: null };
    }

    if (
        entry.userId !== input.authorization.userId &&
        !canViewOrgTimeEntries(input.authorization)
    ) {
        throw new AuthorizationError('You cannot view time entries for other members.');
    }

    return { entry };
}

