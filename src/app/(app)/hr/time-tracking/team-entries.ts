import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    getTeamTimeEntriesForUi,
    type TeamTimeEntry,
} from '@/server/use-cases/hr/time-tracking/get-team-time-entries.cached';

export type { TeamTimeEntry };

export async function buildTeamTimeEntries(
    authorization: RepositoryAuthorizationContext,
): Promise<TeamTimeEntry[]> {
    return getTeamTimeEntriesForUi({ authorization });
}
