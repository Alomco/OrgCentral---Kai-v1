'use client';

import { useEffect, useState } from 'react';

import { defaultThemeTokens, themeTokenKeys, type ThemeTokenMap } from '@/server/theme/tokens';

function readTenantTokens(): ThemeTokenMap {
    if (typeof window === 'undefined') {
        return defaultThemeTokens;
    }

    const styles = getComputedStyle(document.documentElement);
    const entries = themeTokenKeys.map((key) => {
        const raw = styles.getPropertyValue(`--${key}`).trim();
        return [key, (raw || defaultThemeTokens[key]) as ThemeTokenMap[typeof key]];
    });

    return Object.fromEntries(entries) as ThemeTokenMap;
}

export function useTenantTokens(): ThemeTokenMap {
    const [tokens, setTokens] = useState<ThemeTokenMap>(() => readTenantTokens());

    useEffect(() => {
        const update = () => setTokens(readTenantTokens());
        update();

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', update);
        window.addEventListener('visibilitychange', update);

        return () => {
            media.removeEventListener('change', update);
            window.removeEventListener('visibilitychange', update);
        };
    }, []);

    return tokens;
}
