
'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';

import { getThemePreset, themePresets, type ThemePresetId } from '@/server/theme/theme-presets';
import { themeTokenKeys } from '@/server/theme/tokens';

export type ThemeId = ThemePresetId;

interface ThemeContextValue {
    /** Local preview override. When null, the org/server theme is in effect. */
    currentTheme: ThemeId | null;
    setTheme: (themeId: ThemeId) => void;
    clearTheme: () => void;
    themes: readonly {
        id: ThemeId;
        name: string;
        color: string;
    }[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY_PREFIX = 'orgcentral-theme:';
const THEME_CHANGE_EVENT = 'orgcentral-theme-change';
const ORG_SCOPE_CHANGE_EVENT = 'orgcentral-org-scope-change';

function readOrgScope(): string {
    try {
        return document.documentElement.dataset.orgId ?? 'default';
    } catch {
        return 'default';
    }
}

function getThemeStorageKey(): string {
    return `${THEME_STORAGE_KEY_PREFIX}${readOrgScope()}`;
}

function toCssHsl(hsl: string): string {
    return `hsl(${hsl})`;
}

export const THEME_PRESETS = Object.values(themePresets).map((preset) => ({
    id: preset.id as ThemeId,
    name: preset.name,
    color: toCssHsl(preset.tokens.primary),
})) as readonly { id: ThemeId; name: string; color: string }[];

function isThemeId(value: string | null): value is ThemeId {
    return Boolean(value && Object.prototype.hasOwnProperty.call(themePresets, value));
}

function readStoredTheme(): ThemeId | null {
    try {
        const value = localStorage.getItem(getThemeStorageKey());
        return isThemeId(value) ? value : null;
    } catch {
        return null;
    }
}

function subscribeToThemeChanges(onStoreChange: () => void) {
    const handler = () => onStoreChange();

    window.addEventListener('storage', handler);
    window.addEventListener(THEME_CHANGE_EVENT, handler);
    window.addEventListener(ORG_SCOPE_CHANGE_EVENT, handler);

    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(THEME_CHANGE_EVENT, handler);
        window.removeEventListener(ORG_SCOPE_CHANGE_EVENT, handler);
    };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const storedTheme = useSyncExternalStore(
        subscribeToThemeChanges,
        readStoredTheme,
        () => null,
    );

    const themes = useMemo(() => THEME_PRESETS, []);

    const applyThemeToDOM = (themeId: ThemeId) => {
        const preset = getThemePreset(themeId);
        const root = document.documentElement;

        // Apply only defined theme tokens to allow globals.css placeholders to work for undefined ones
        Object.entries(preset.tokens).forEach(([key, value]) => {
            if (typeof value === 'string' && value.length > 0) {
                root.style.setProperty(`--${key}`, value);
            }
        });
    };

    const clearThemeFromDOM = () => {
        const root = document.documentElement;
        themeTokenKeys.forEach((key) => {
            root.style.removeProperty(`--${key}`);
        });
    };

    useEffect(() => {
        // Only override tenant-provided theme when a user has explicitly picked one.
        if (!storedTheme) {
            clearThemeFromDOM();
            return;
        }

        applyThemeToDOM(storedTheme);
    }, [storedTheme]);

    const setTheme = (themeId: ThemeId) => {
        localStorage.setItem(getThemeStorageKey(), themeId);
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
        applyThemeToDOM(themeId);
    };

    const clearTheme = () => {
        localStorage.removeItem(getThemeStorageKey());
        window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
        clearThemeFromDOM();
    };

    return (
        <ThemeContext.Provider value={{ currentTheme: storedTheme, setTheme, clearTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
