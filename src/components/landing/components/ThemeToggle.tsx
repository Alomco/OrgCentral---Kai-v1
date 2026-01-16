"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useSyncExternalStore } from "react";

function useIsClient(): boolean {
    return useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );
}

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useIsClient();

    const activeTheme = useMemo(() => {
        return resolvedTheme === "dark" || resolvedTheme === "light" ? resolvedTheme : null;
    }, [resolvedTheme]);

    return (
        <button
            type="button"
            onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
            className="relative w-10 h-10 rounded-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-600 hover:scale-110 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl"
            aria-label="Toggle theme"
        >
            {mounted ? (
                activeTheme === "dark" ? (
                    <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                ) : activeTheme === "light" ? (
                    <Moon className="h-5 w-5 text-slate-700 group-hover:rotate-12 transition-transform duration-300" />
                ) : (
                    <div className="h-5 w-5 rounded-full bg-slate-300/60 dark:bg-slate-600/60" />
                )
            ) : (
                <div className="h-5 w-5 rounded-full bg-slate-300/60 dark:bg-slate-600/60" />
            )}
        </button>
    );
}
