import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_LONG } from '@/server/repositories/cache-profiles';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { appLogger } from '@/server/logging/structured-logger';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import { CACHE_SCOPE_TENANT_THEME } from '@/server/repositories/cache-scopes';
import { PrismaThemeRepository } from '@/server/repositories/prisma/org/theme/prisma-theme-repository';
import { getThemePreset, defaultPresetId } from './theme-presets';
import { defaultUiStyle, isUiStyleKey } from './ui-style-presets';
import type { TenantTheme, ThemeTokenMap } from './tokens';
import type { OrgThemeSettings } from '@/server/types/theme-types';

// Re-export for convenience
export type { OrgThemeSettings };

export interface TenantThemeCacheContext {
    classification: DataClassificationLevel;
    residency: DataResidencyZone;
}

const DEFAULT_ANONYMOUS_CONTEXT: TenantThemeCacheContext = {
    classification: 'OFFICIAL',
    residency: 'UK_ONLY',
};

/**
 * Get the theme repository instance (uses default Prisma client)
 */
function getThemeRepository(): PrismaThemeRepository {
    return new PrismaThemeRepository();
}

/**
 * Resolve theme tokens from org settings
 */
function resolveThemeFromSettings(
    orgId: string,
    orgSettings: OrgThemeSettings | null,
): TenantTheme {
    // Get base preset (org-specific or default)
    const presetId = orgSettings?.presetId ?? defaultPresetId;
    const preset = getThemePreset(presetId);

    // Apply any custom overrides on top of preset
    const customOverrides = orgSettings?.customOverrides ?? {};
    const uiStyleCandidate = orgSettings?.uiStyleId ?? null;
    const uiStyleId = isUiStyleKey(uiStyleCandidate) ? uiStyleCandidate : defaultUiStyle;

    return {
        orgId,
        presetId,
        tokens: { ...preset.tokens, ...customOverrides } as ThemeTokenMap,
        darkTokens: { ...preset.darkTokens, ...customOverrides } as ThemeTokenMap,
        uiStyleId,
        updatedAt: orgSettings?.updatedAt ?? new Date(),
    };
}

function resolveCacheContext(orgId: string, context?: TenantThemeCacheContext): TenantThemeCacheContext {
    if (orgId === 'default') {
        return context ?? DEFAULT_ANONYMOUS_CONTEXT;
    }

    if (!context) {
        throw new Error('getTenantTheme requires classification and residency for org-scoped requests.');
    }

    return context;
}

async function loadTenantTheme(orgId: string): Promise<TenantTheme> {
    if (orgId === 'default') {
        return resolveThemeFromSettings('default', null);
    }

    try {
        const repo = getThemeRepository();
        const orgSettings = await repo.getTheme(orgId);
        return resolveThemeFromSettings(orgId, orgSettings);
    } catch (error) {
        appLogger.warn('theme.load.failed', {
            orgId,
            error: error instanceof Error ? error.message : String(error),
        });
        return resolveThemeFromSettings(orgId, null);
    }
}

async function getCachedTenantTheme(
    orgId: string,
    context: TenantThemeCacheContext,
): Promise<TenantTheme> {
    'use cache';
    cacheLife(CACHE_LIFE_LONG);
    registerOrgCacheTag(orgId, CACHE_SCOPE_TENANT_THEME, context.classification, context.residency);
    return loadTenantTheme(orgId);
}

/**
 * Get tenant theme with database lookup and caching
 */
export async function getTenantTheme(
    orgId?: string | null,
    context?: TenantThemeCacheContext,
): Promise<TenantTheme> {
    const resolvedOrgId = orgId ?? 'default';
    const cacheContext = resolveCacheContext(resolvedOrgId, context);

    if (cacheContext.classification !== 'OFFICIAL') {
        noStore();
        return loadTenantTheme(resolvedOrgId);
    }

    return getCachedTenantTheme(resolvedOrgId, cacheContext);
}

export async function getTenantThemeWithContext(
    orgId: string | null | undefined,
    context: TenantThemeCacheContext,
): Promise<TenantTheme> {
    return getTenantTheme(orgId, context);
}

