import { z } from 'zod';

const SEARCH_QUERY_PATTERN = /^[\p{L}\p{N}@._'\-\s]+$/u;

function normalizeQuery(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

export const topbarSearchEntitySchema = z.enum([
    'employee',
    'leave_request',
    'absence',
    'training_record',
    'onboarding_invitation',
    'onboarding_checklist',
    'compliance_item',
    'policy',
    'support_ticket',
]);

export type TopbarSearchEntity = z.infer<typeof topbarSearchEntitySchema>;

export const topbarSearchQuerySchema = z.object({
    q: z
        .string()
        .trim()
        .min(2, 'Search term must be at least 2 characters.')
        .max(80, 'Search term must be 80 characters or fewer.')
        .regex(SEARCH_QUERY_PATTERN, 'Search term contains unsupported characters.')
        .transform(normalizeQuery),
    limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const topbarSearchResultSchema = z.object({
    title: z.string().min(1).max(120),
    subtitle: z.string().min(1).max(240),
    href: z.string().min(1).max(240).startsWith('/'),
    type: topbarSearchEntitySchema,
    rank: z.number().int().min(0).max(1_000),
});

export const topbarSearchResponseSchema = z.object({
    results: z.array(topbarSearchResultSchema),
});

export type TopbarSearchQuery = z.infer<typeof topbarSearchQuerySchema>;
export type TopbarSearchResult = z.infer<typeof topbarSearchResultSchema>;
export type TopbarSearchResponse = z.infer<typeof topbarSearchResponseSchema>;

export function parseTopbarSearchQuery(searchParams: URLSearchParams): TopbarSearchQuery {
    return topbarSearchQuerySchema.parse({
        q: searchParams.get('q') ?? '',
        limit: searchParams.get('limit') ?? undefined,
    });
}
