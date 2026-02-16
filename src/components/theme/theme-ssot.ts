'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeModeOption {
    id: ThemeMode;
    label: string;
    icon: LucideIcon;
}

export const THEME_MODE_OPTIONS: readonly ThemeModeOption[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
] as const;

export function useHydrated(): boolean {
    return useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );
}

export function resolveThemeModeLabel(mode: ThemeMode, resolvedTheme?: string): string {
    if (mode === 'system') {
        if (resolvedTheme === 'dark') {
            return 'System (Dark)';
        }

        if (resolvedTheme === 'light') {
            return 'System (Light)';
        }

        return 'System';
    }

    const matched = THEME_MODE_OPTIONS.find((option) => option.id === mode);
    return matched?.label ?? 'System';
}
