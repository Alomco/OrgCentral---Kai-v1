'use client';

import { useId, useState } from 'react';

import { cn } from '@/lib/utils';

const transitionEase = 'transition-all duration-200 ease-out';

export type ToggleVibe = 'glow' | 'gradient' | 'glass' | 'outline' | 'solid';

export interface PremiumToggleProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    vibe?: ToggleVibe;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const toggleSizes = {
    sm: { track: 'h-5 w-9', thumb: 'size-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'size-5', translate: 'translate-x-5' },
    lg: { track: 'h-7 w-14', thumb: 'size-6', translate: 'translate-x-7' },
};

export function PremiumToggle({
    checked,
    defaultChecked,
    onCheckedChange,
    disabled,
    label,
    vibe = 'solid',
    size = 'md',
    className,
}: PremiumToggleProps) {
    const [isChecked, setIsChecked] = useState(defaultChecked ?? false);
    const id = useId();
    const state = checked ?? isChecked;
    const sizeConfig = toggleSizes[size];

    const handleToggle = () => {
        if (disabled) { return; }
        const newState = !state;
        setIsChecked(newState);
        onCheckedChange?.(newState);
    };

    const vibeStyles: Record<ToggleVibe, string> = {
        glow: state ? 'bg-primary shadow-[0_0_20px_oklch(var(--primary)/0.5)]' : 'bg-muted',
        gradient: state ? 'bg-gradient-to-r from-primary to-accent' : 'bg-muted',
        glass: state
            ? 'bg-primary/60 backdrop-blur-sm border border-primary/40'
            : 'bg-card/50 backdrop-blur-sm border border-border/40',
        outline: state ? 'bg-primary border-2 border-primary' : 'bg-transparent border-2 border-border',
        solid: state ? 'bg-primary' : 'bg-muted',
    };

    return (
        <div className={cn('inline-flex items-center gap-3', className)}>
            <button
                type="button"
                role="switch"
                aria-checked={state}
                id={id}
                disabled={disabled}
                onClick={handleToggle}
                data-slot="premium-toggle"
                data-vibe={vibe}
                className={cn(
                    'relative inline-flex shrink-0 cursor-pointer rounded-full p-0.5',
                    transitionEase,
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    sizeConfig.track,
                    vibeStyles[vibe],
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none block rounded-full bg-background shadow-md',
                        'transition-transform duration-200 ease-out',
                        sizeConfig.thumb,
                        state && sizeConfig.translate,
                    )}
                />
            </button>

            {label ? (
                <label
                    htmlFor={id}
                    className={cn(
                        'text-sm cursor-pointer select-none text-foreground',
                        disabled && 'cursor-not-allowed opacity-50',
                    )}
                >
                    {label}
                </label>
            ) : null}
        </div>
    );
}
