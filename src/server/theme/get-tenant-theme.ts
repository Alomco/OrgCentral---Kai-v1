'use server';

import { cacheLife } from 'next/cache';

import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_TENANT_THEME } from '@/server/repositories/cache-scopes';
import { defaultThemeTokens, type TenantTheme, type ThemeTokenMap } from './tokens';

const mockThemeOverrides: Record<string, Partial<ThemeTokenMap>> = {
    'org-demo': {
        primary: '257 74% 64%',
        'primary-foreground': '260 100% 98%',
        'sidebar-background': '258 54% 18%',
        'sidebar-foreground': '260 40% 96%',
    },
};

function resolveTheme(orgId?: string | null): TenantTheme {
    const key = orgId ?? 'default';
    const overrides = mockThemeOverrides[key] ?? {};
    return {
        orgId: key,
        tokens: { ...defaultThemeTokens, ...overrides },
        updatedAt: new Date(),
    };
}

export async function getTenantTheme(orgId?: string | null): Promise<TenantTheme> {
    'use cache';
    cacheLife('hours');

    const resolvedOrgId = orgId ?? 'default';
    registerOrgCacheTag(resolvedOrgId, CACHE_SCOPE_TENANT_THEME);

    return Promise.resolve(resolveTheme(resolvedOrgId));
}
