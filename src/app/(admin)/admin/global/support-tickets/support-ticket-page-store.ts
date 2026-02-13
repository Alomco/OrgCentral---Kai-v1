import { cacheLife, unstable_noStore as noStore } from 'next/cache';
import { registerCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_PLATFORM_SUPPORT } from '@/server/repositories/cache-scopes';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import { listSupportTicketsService } from '@/server/services/platform/admin/support-ticket-service';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SupportTicket } from '@/server/types/platform/support-tickets';

export async function loadSupportTicketsForUi(authorization: RepositoryAuthorizationContext): Promise<SupportTicket[]> {
    if (authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return listSupportTicketsService(authorization);
    }

    return loadSupportTicketsCached(toCacheSafeAuthorizationContext(authorization));
}

async function loadSupportTicketsCached(authorization: RepositoryAuthorizationContext): Promise<SupportTicket[]> {
    'use cache';
    cacheLife('minutes');
    registerCacheTag({
        orgId: authorization.orgId,
        scope: CACHE_SCOPE_PLATFORM_SUPPORT,
        classification: authorization.dataClassification,
        residency: authorization.dataResidency,
    });

    return listSupportTicketsService(authorization);
}
