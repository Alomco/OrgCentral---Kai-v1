"use client";

import { Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { THEME_MODE_OPTIONS, useHydrated } from '@/components/theme/theme-ssot';

export function ThemeTogglePanel() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isMounted = useHydrated();
    const currentTheme = isMounted ? (resolvedTheme ?? theme ?? 'system') : null;

    return (
        <article
            suppressHydrationWarning
            className="rounded-xl p-5"
            data-ui-surface="container"
        >
            {/* Gradient icon box */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/25">
                <Sun className="h-5 w-5" />
            </div>

            {/* Clean typography */}
            <h2 className="mt-4 text-lg font-semibold tracking-tight">Theme Control</h2>
            <p className="mt-1 text-sm text-muted-foreground/80">
                Toggle between light, dark, and system themes.
            </p>

            {/* Pill buttons - no borders, use shadows */}
            <div className="mt-4 flex flex-wrap gap-2">
                {THEME_MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setTheme(id)}
                        disabled={!isMounted}
                        data-ui-surface={isMounted && currentTheme === id ? 'interactive' : undefined}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
                            isMounted && currentTheme === id
                                ? 'bg-primary/15 text-primary shadow-sm shadow-primary/20'
                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                            !isMounted && 'opacity-50'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Status badge - subtle background */}
            <div className="mt-4">
                <span className="inline-flex rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                    Current: {currentTheme ?? 'loading'}
                </span>
            </div>
        </article>
    );
}
