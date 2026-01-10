/**
 * 🎨 Theme Control Panel for Showcase
 * 
 * Floating panel to switch themes and UI styles in the showcase.
 * Client component with smooth animations.
 * 
 * @module app/(dev)/dev/premium-showcase
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Palette, Sun, Moon, Monitor, Sparkles, Check, X } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { useTheme as useColorTheme } from '@/components/theme/theme-provider';
import { useUiStyle } from '@/components/theme/ui-style-provider';
import { FadeIn } from '@/components/theme/primitives/motion';
import { Heading, Caption } from '@/components/theme/primitives/typography';
import { useRegisterDevelopmentAction } from '@/components/dev/toolbar';
import styles from './theme-control-panel.module.css';

function ThemeSwatch({ color, label }: { color: string; label: string }) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref.current) { return; }
        ref.current.style.setProperty('--theme-swatch', color);
    }, [color]);

    return (
        <div
            ref={ref}
            className={cn('h-8 w-8 rounded-lg shadow-md', styles.swatch)}
            aria-hidden
            role="presentation"
            data-theme-name={label}
        />
    );
}

export function ThemeControlPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const { currentTheme, setTheme: setColorTheme, themes } = useColorTheme();
    const { currentStyle, setStyle, styles } = useUiStyle();
    const { theme: mode, setTheme: setMode } = useNextTheme();

    const modeOptions = useMemo(() => [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
    ] as const, []);

    // Define content to be hoisted.
    // Memoized to prevent infinite update loops with DevToolbar context.
    const component = useMemo(() => (
        <FadeIn>
            <div
                className={cn(
                    'fixed bottom-4 right-20 z-(--z-dev-widget)',
                    'w-80 max-h-[70vh] overflow-y-auto',
                    'rounded-2xl',
                    'bg-card/95 backdrop-blur-xl',
                    'shadow-2xl shadow-black/20',
                    'border border-border/50',
                    'animate-in slide-in-from-right-4 fade-in duration-300',
                )}
                data-slot="theme-control-panel"
            >
                {/* Header */}
                <div className="p-4 border-b border-border/50 flex justify-between items-start">
                    <div>
                        <Heading size="h5">🎨 Customize Theme</Heading>
                        <Caption className="mt-1">
                            Switch modes, colors & UI styles
                        </Caption>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Close theme control panel"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Mode Section */}
                <div className="p-4 border-b border-border/50">
                    <Caption className="mb-3">Display Mode</Caption>
                    <div className="grid grid-cols-3 gap-2">
                        {modeOptions.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setMode(id)}
                                className={cn(
                                    'flex flex-col items-center gap-1 p-3 rounded-xl',
                                    'transition-all duration-200',
                                    mode === id
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Icon className="size-5" />
                                <span className="text-xs font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* UI Style Section */}
                <div className="p-4 border-b border-border/50">
                    <Caption className="mb-3">UI Style</Caption>
                    <div className="space-y-2">
                        {styles.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setStyle(style.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 p-3 rounded-xl',
                                    'transition-all duration-200 text-left',
                                    currentStyle === style.id
                                        ? 'bg-primary/10 ring-2 ring-primary/50'
                                        : 'bg-muted/30 hover:bg-muted/50',
                                )}
                            >
                                <span className="text-xl">{style.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{style.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {style.description}
                                    </div>
                                </div>
                                {currentStyle === style.id && (
                                    <Check className="size-4 text-primary shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Theme Section */}
                <div className="p-4">
                    <Caption className="mb-3">Color Theme</Caption>
                    <div className="grid grid-cols-3 gap-2">
                        {themes.slice(0, 9).map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setColorTheme(theme.id)}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-2 rounded-xl',
                                    'transition-all duration-200',
                                    currentTheme === theme.id
                                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                        : 'hover:bg-muted/50',
                                )}
                            >
                                <ThemeSwatch color={theme.color} label={theme.name} />
                                <span className="text-[10px] font-medium truncate w-full text-center">
                                    {theme.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer with Sparkles */}
                <div className="p-3 bg-muted/30 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="size-3" />
                    <span>Try different combinations!</span>
                </div>
            </div>
        </FadeIn>
    ), [modeOptions, mode, setMode, styles, currentStyle, setStyle, themes, currentTheme, setColorTheme]);

    const action = useMemo(() => ({
        id: "showcase-theme",
        label: "Showcase Theme",
        icon: <Palette className="size-4" />,
        onClick: () => setIsOpen(p => !p),
        isActive: isOpen,
        order: 5,
        component: component // Pass the component
    }), [isOpen, component]);

    useRegisterDevelopmentAction(action);

    return null; // Rendered by DevToolbar
}
