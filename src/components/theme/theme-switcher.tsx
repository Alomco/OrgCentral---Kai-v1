'use client';

import { useState } from 'react';
import { Palette, Check, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './theme-provider';
import { useUiStyle } from './ui-style-provider';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
    const { currentTheme, setTheme, clearTheme, themes } = useTheme();
    const { currentStyle, setStyle, styles } = useUiStyle();

    // We can use the open state if needed, or let Popover handle it.
    // For auto-closing on selection, we might need controlled state.
    const [open, setOpen] = useState(false);

    const swatchCss = themes
        .map((theme) => `.orgcentral-theme-swatch[data-theme-id="${theme.id}"]{background-color:${theme.color};}`)
        .join('\n');

    const handleThemeChange = (themeId: (typeof themes)[number]['id']) => {
        setTheme(themeId);
    };

    const selectedLabel =
        currentTheme ? themes.find((t) => t.id === currentTheme)?.name : 'Org default';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <style dangerouslySetInnerHTML={{ __html: swatchCss }} />
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg",
                        "bg-gradient-to-r from-primary/10 to-accent/10",
                        "border-primary/20",
                        "hover:from-primary/20 hover:to-accent/20",
                        "transition-all duration-300",
                        "text-sm font-medium"
                    )}
                >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Theme</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 overflow-hidden rounded-xl border-border bg-background/95 backdrop-blur-xl shadow-2xl"
                align="start"
                sideOffset={10}
            >
                <Tabs defaultValue="colors" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                        <TabsTrigger
                            value="colors"
                            className="flex-1 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                        >
                            <Palette className="mr-2 h-4 w-4" />
                            Colors
                        </TabsTrigger>
                        <TabsTrigger
                            value="styles"
                            className="flex-1 rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            UI Style
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="colors" className="m-0 p-0">
                        <div className="p-2 max-h-72 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeChange(theme.id)}
                                        className={cn(
                                            "group relative p-3 rounded-lg border transition-all duration-200 text-left w-full",
                                            "hover:scale-[1.02] hover:shadow-md",
                                            currentTheme === theme.id
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div
                                            className="orgcentral-theme-swatch h-10 rounded-md mb-2 w-full"
                                            data-theme-id={theme.id}
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium truncate">{theme.name}</span>
                                            {currentTheme === theme.id && (
                                                <Check className="h-3 w-3 text-primary shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="styles" className="m-0 p-0">
                        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                            {styles.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setStyle(style.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                        currentStyle === style.id
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent hover:bg-muted/50"
                                    )}
                                >
                                    <span className="text-xl shrink-0">{style.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{style.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {style.description}
                                        </div>
                                    </div>
                                    {currentStyle === style.id && (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="p-3 border-t border-border bg-muted/30 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {selectedLabel} • {styles.find(s => s.id === currentStyle)?.name}
                    </span>
                    <button
                        onClick={() => {
                            clearTheme();
                            setOpen(false);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
