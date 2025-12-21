import type { ReactNode } from 'react';

import { getTenantTheme } from '@/server/theme/get-tenant-theme';
import type { ThemeTokenKey, ThemeTokenMap } from '@/server/theme/tokens';

export interface TenantThemeRegistryProps {
    orgId?: string | null;
    children?: ReactNode;
}

const tenantOverrideKeys = [
    'primary',
    'primary-foreground',
    'accent',
    'accent-foreground',
    'sidebar',
    'sidebar-background',
    'sidebar-foreground',
    'sidebar-primary',
    'sidebar-primary-foreground',
    'sidebar-accent',
    'sidebar-accent-foreground',
    'sidebar-border',
    'sidebar-ring',
] as const satisfies readonly ThemeTokenKey[];

function buildCssVariables(tokens: ThemeTokenMap, keys: readonly ThemeTokenKey[]): string {
    return keys
        .map((key) => `--${key}: ${tokens[key]};`)
        .join(' ');
}

export async function TenantThemeRegistry({ orgId, children }: TenantThemeRegistryProps) {
    const theme = await getTenantTheme(orgId);

    const cssVariables = buildCssVariables(theme.tokens, tenantOverrideKeys);

    return (
        <>
            <style
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: `:root { ${cssVariables} } .dark { ${cssVariables} }` }}
            />
            {children}
        </>
    );
}
