import { cacheLife } from 'next/cache';

import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import type { OrgContext } from './org-context';

type CacheScope = string;

export async function cacheOrgRead<T>(
    org: OrgContext,
    scope: CacheScope,
    loader: () => Promise<T>,
): Promise<T> {
    'use cache';
    cacheLife('minutes');
    registerOrgCacheTag(org.orgId, scope, org.classification, org.residency);
    return loader();
}
