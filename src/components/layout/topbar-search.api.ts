import { queryOptions } from '@tanstack/react-query';
import { topbarSearchResponseSchema, type TopbarSearchResponse } from '@/lib/search/topbar-search-contract';

const TOPBAR_DEFAULT_LIMIT = 8;

export const topbarSearchKeys = {
    list: (orgId: string, query: string, limit: number) => ['org', orgId, 'topbar-search', query, String(limit)] as const,
};

export function topbarSearchQueryOptions(orgId: string, query: string, limit = TOPBAR_DEFAULT_LIMIT) {
    return queryOptions({
        queryKey: topbarSearchKeys.list(orgId, query, limit),
        queryFn: async (): Promise<TopbarSearchResponse> => {
            const params = new URLSearchParams({
                q: query,
                limit: String(limit),
            });
            const response = await fetch(`/api/org/${orgId}/search?${params.toString()}`, {
                cache: 'no-store',
            });
            if (!response.ok) {
                throw new Error('Unable to fetch search results.');
            }
            return topbarSearchResponseSchema.parse(await response.json());
        },
        staleTime: 15_000,
    });
}
