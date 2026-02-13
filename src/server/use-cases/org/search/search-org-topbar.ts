import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfile } from '@/server/types/hr-types';
import type { PeopleServiceContract } from '@/server/services/hr/people/people-service.provider';
import type { TopbarSearchResponse, TopbarSearchResult } from '@/lib/search/topbar-search-contract';

interface SearchOrgTopbarDependencies {
    peopleService: Pick<PeopleServiceContract, 'listEmployeeProfiles'>;
}

interface SearchOrgTopbarInput {
    authorization: RepositoryAuthorizationContext;
    query: string;
    limit: number;
}

function normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim();
}

function resolveEmployeeTitle(profile: EmployeeProfile): string {
    const displayName = normalizeText(profile.displayName);
    if (displayName.length > 0) {
        return displayName;
    }

    const firstName = normalizeText(profile.firstName);
    const lastName = normalizeText(profile.lastName);
    const fallback = `${firstName} ${lastName}`.trim();
    if (fallback.length > 0) {
        return fallback;
    }

    return profile.employeeNumber;
}

function scoreField(query: string, field: string): number {
    const normalizedField = field.toLowerCase();
    if (!normalizedField) {
        return 0;
    }
    if (normalizedField === query) {
        return 120;
    }
    if (normalizedField.startsWith(query)) {
        return 70;
    }
    if (normalizedField.includes(query)) {
        return 35;
    }
    return 0;
}

function scoreEmployee(profile: EmployeeProfile, query: string): number {
    const title = resolveEmployeeTitle(profile);
    const employeeNumber = normalizeText(profile.employeeNumber);
    const email = normalizeText(profile.email);
    const department = normalizeText(profile.departmentId);
    const jobTitle = normalizeText(profile.jobTitle);

    return (
        scoreField(query, title) +
        scoreField(query, employeeNumber) +
        scoreField(query, email) +
        scoreField(query, department) +
        scoreField(query, jobTitle)
    );
}

function toEmployeeResult(profile: EmployeeProfile, query: string): TopbarSearchResult {
    const parts = [
        normalizeText(profile.employeeNumber),
        normalizeText(profile.email),
        normalizeText(profile.departmentId),
        normalizeText(profile.jobTitle),
    ].filter((value) => value.length > 0);

    const subtitle = parts.length > 0 ? parts.join(' | ') : 'Employee record';

    return {
        title: resolveEmployeeTitle(profile),
        subtitle,
        href: `/hr/employees/${profile.id}`,
        type: 'employee',
        rank: scoreEmployee(profile, query),
    };
}

export async function searchOrgTopbar(
    dependencies: SearchOrgTopbarDependencies,
    input: SearchOrgTopbarInput,
): Promise<TopbarSearchResponse> {
    const normalizedQuery = input.query.toLowerCase();
    const result = await dependencies.peopleService.listEmployeeProfiles({
        authorization: input.authorization,
        payload: {
            filters: {
                search: input.query,
            },
        },
    });

    const employeeResults = result.profiles
        .filter((profile) => profile.orgId === input.authorization.orgId)
        .map((profile) => toEmployeeResult(profile, normalizedQuery))
        .sort((left, right) => {
            if (left.rank !== right.rank) {
                return right.rank - left.rank;
            }
            return left.title.localeCompare(right.title);
        })
        .slice(0, input.limit);

    return { results: employeeResults };
}
