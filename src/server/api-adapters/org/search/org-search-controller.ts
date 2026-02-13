import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { parseTopbarSearchQuery, topbarSearchResponseSchema, type TopbarSearchResponse } from '@/lib/search/topbar-search-contract';
import { searchOrgTopbar } from '@/server/use-cases/org/search/search-org-topbar';
import type { PeopleServiceContract } from '@/server/services/hr/people/people-service.provider';

interface OrgSearchControllerDependencies {
    peopleService: Pick<PeopleServiceContract, 'listEmployeeProfiles'>;
}

export async function listOrgTopbarSearchController(
    request: Request,
    orgId: string,
    dependencies?: OrgSearchControllerDependencies,
): Promise<TopbarSearchResponse> {
    const query = parseTopbarSearchQuery(new URL(request.url).searchParams);

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId,
            requiredPermissions: { employeeProfile: ['list'] },
            auditSource: 'api:org:search:topbar',
            action: 'org.search.topbar',
            resourceType: 'org.search',
            resourceAttributes: {
                queryLength: query.q.length,
                limit: query.limit,
                entity: 'employee',
            },
        },
    );

    const result = await searchOrgTopbar(
        {
            peopleService: dependencies?.peopleService ?? getPeopleService(),
        },
        {
            authorization,
            query: query.q,
            limit: query.limit,
        },
    );

    return topbarSearchResponseSchema.parse(result);
}
