"use client";

import * as React from "react";
import { Hammer, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDevelopmentToolbar } from "./development-toolbar-context";

export function DevelopmentToolbar() {
    const { actions } = useDevelopmentToolbar();
    const [isOpen, setIsOpen] = React.useState(false);

    if (actions.length === 0) {
        return null;
    }

    return (
        <aside aria-label="Developer tools" className="contents">
            {actions.map((action) =>
                action.isActive && action.component ? <React.Fragment key={`panel-${action.id}`}>{action.component}</React.Fragment> : null,
            )}

            <div className="fixed bottom-4 right-4 z-(--z-dev-widget) flex flex-col items-end gap-2">
                <div
                    className={cn(
                        "flex flex-col items-end gap-2 transition-all duration-300 origin-bottom-right",
                        isOpen
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-95 translate-y-4 pointer-events-none absolute bottom-12 right-0",
                    )}
                >
                    {actions.map((action) => (
                        <div key={action.id} className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm transition-opacity",
                                    isOpen ? "opacity-100" : "opacity-0",
                                )}
                            >
                                {action.label}
                            </span>

                            <button
                                onClick={() => {
                                    action.onClick();
                                }}
                                className={cn(
                                    "h-10 w-10 flex items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all",
                                    action.isActive
                                        ? "bg-primary text-primary-foreground border-primary/50"
                                        : "bg-card/80 text-muted-foreground border-border/50 hover:bg-card hover:text-foreground hover:scale-105",
                                )}
                                aria-label={action.label}
                            >
                                {action.icon}
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-12 w-12 flex items-center justify-center rounded-full shadow-xl border border-primary/20 backdrop-blur-xl transition-all hover:scale-105 active:scale-95",
                        isOpen ? "bg-muted text-foreground rotate-90" : "bg-primary text-primary-foreground",
                    )}
                    aria-label="Toggle Development Tools"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Hammer className="h-5 w-5" />}
                </button>
            </div>
        </aside>
    );
}