import { buildCacheTag, invalidateCache, registerCacheTag } from '@/server/lib/cache-tags';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export const HR_NOTIFICATION_CACHE_SCOPE = 'hr-notifications';

export interface HrNotificationCacheContext {
    orgId: string;
    classification: DataClassificationLevel;
    residency: DataResidencyZone;
}

export function buildHrNotificationTag(context: HrNotificationCacheContext): string {
    return buildCacheTag({
        orgId: context.orgId,
        classification: context.classification,
        residency: context.residency,
        scope: HR_NOTIFICATION_CACHE_SCOPE,
    });
}

export function registerHrNotificationTag(context: HrNotificationCacheContext): void {
    registerCacheTag({
        orgId: context.orgId,
        classification: context.classification,
        residency: context.residency,
        scope: HR_NOTIFICATION_CACHE_SCOPE,
    });
}

export async function invalidateHrNotifications(context: HrNotificationCacheContext): Promise<void> {
    await invalidateCache({
        orgId: context.orgId,
        classification: context.classification,
        residency: context.residency,
        scope: HR_NOTIFICATION_CACHE_SCOPE,
    });
}
