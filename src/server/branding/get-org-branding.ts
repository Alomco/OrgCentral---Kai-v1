'use server';

import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_LONG } from '@/server/repositories/cache-profiles';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_BRANDING } from '@/server/repositories/cache-scopes';
import { getBrandingService } from '@/server/services/org/branding/branding-service.provider';
import type { OrgBranding } from '@/server/types/branding-types';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface GetOrgBrandingInput {
    orgId: string;
    residency: DataResidencyZone;
    classification: DataClassificationLevel;
}

export async function getOrgBranding(input: GetOrgBrandingInput): Promise<OrgBranding | null> {
    if (input.classification !== 'OFFICIAL') {
        noStore();
        const service = getBrandingService();
        return service.getOrgBranding(input.orgId);
    }

    return getOrgBrandingCached(input);
}

async function getOrgBrandingCached(input: GetOrgBrandingInput): Promise<OrgBranding | null> {
    'use cache';
    cacheLife(CACHE_LIFE_LONG);

    registerOrgCacheTag(input.orgId, CACHE_SCOPE_BRANDING, input.classification, input.residency);

    const service = getBrandingService();
    return service.getOrgBranding(input.orgId);
}
