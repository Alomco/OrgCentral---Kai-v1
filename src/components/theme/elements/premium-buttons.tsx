/**
 * 💎 Premium Button Components
 * 
 * Uses project's design system (primary/accent purple-pink theme).
 * Follows existing button.tsx patterns with CVA variants.
 * 
 * @module components/theme/elements/premium-buttons
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Premium Button Variants - Using Project's Design System
// ============================================================================

const hoverLift = 'hover:-translate-y-0.5';
const activeReset = 'active:translate-y-0';

const premiumButtonVariants = cva(
    [
        'inline-flex items-center justify-center gap-2 whitespace-nowrap',
        'rounded-xl font-semibold text-sm',
        'transition-all duration-200 ease-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
    ].join(' '),
    {
        variants: {
            /**
             * 5 Distinct Premium Vibes using project's color system
             */
            vibe: {
                // 🌟 GLOW - Primary color with strong glow
                glow: [
                    'bg-primary text-primary-foreground',
                    'shadow-[0_0_20px_oklch(var(--primary)/0.5),0_0_40px_oklch(var(--primary)/0.25)]',
                    'hover:shadow-[0_0_30px_oklch(var(--primary)/0.7),0_0_60px_oklch(var(--primary)/0.35)]',
                    hoverLift,
                    `${activeReset} active:shadow-[0_0_15px_oklch(var(--primary)/0.4)]`,
                ].join(' '),

                // 🌈 GRADIENT - Primary to accent gradient
                gradient: [
                    'bg-gradient-to-r from-primary via-accent to-primary',
                    'bg-[length:200%_auto] bg-left',
                    'text-white',
                    'shadow-lg shadow-primary/30',
                    'hover:bg-right hover:shadow-xl hover:shadow-accent/40',
                    hoverLift,
                    activeReset,
                ].join(' '),

                // 🧊 GLASS - Glassmorphism with project colors
                glass: [
                    'bg-card/60 text-foreground',
                    'backdrop-blur-xl',
                    'border border-border/50',
                    'shadow-lg shadow-primary/10',
                    'hover:bg-card/80 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/20',
                    hoverLift,
                    `${activeReset} active:bg-card/70`,
                ].join(' '),

                // ✨ OUTLINE - Gradient border effect
                outline: [
                    'bg-transparent text-primary',
                    'border-2 border-primary/50',
                    'hover:bg-primary/10 hover:border-primary',
                    'hover:shadow-[0_0_20px_oklch(var(--primary)/0.3)]',
                    hoverLift,
                    `${activeReset} active:bg-primary/15`,
                ].join(' '),

                // 💎 SOLID - Premium filled with depth
                solid: [
                    'bg-secondary text-secondary-foreground',
                    'border border-border/30',
                    'shadow-md',
                    'hover:bg-secondary/80 hover:shadow-lg hover:border-primary/20',
                    hoverLift,
                    `${activeReset} active:shadow-sm`,
                ].join(' '),
            },
            size: {
                sm: 'h-9 px-4',
                md: 'h-10 px-5',
                lg: 'h-11 px-6 text-base',
                xl: 'h-12 px-8 text-lg',
                icon: 'h-10 w-10 p-0',
            },
        },
        defaultVariants: {
            vibe: 'solid',
            size: 'md',
        },
    }
);

// ============================================================================
// Types
// ============================================================================

export type ButtonVibe = 'glow' | 'gradient' | 'glass' | 'outline' | 'solid';

export interface PremiumButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
    vibe?: ButtonVibe;
}

// ============================================================================
// Premium Button Component
// ============================================================================

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({ className, vibe, size, ...props }, ref) => {
        return (
            <button
                ref={ref}
                data-slot="premium-button"
                data-vibe={vibe}
                className={cn(premiumButtonVariants({ vibe, size }), className)}
                {...props}
            />
        );
    }
);

PremiumButton.displayName = 'PremiumButton';

// ============================================================================
// Icon Button
// ============================================================================

export interface PremiumIconButtonProps extends Omit<PremiumButtonProps, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    'aria-label': string;
}

export const PremiumIconButton = forwardRef<HTMLButtonElement, PremiumIconButtonProps>(
    ({ size = 'md', className, ...props }, ref) => {
        const sizeMap = { sm: 'h-9 w-9', md: 'h-10 w-10', lg: 'h-12 w-12' };

        return (
            <PremiumButton
                ref={ref}
                size="icon"
                className={cn('rounded-full', sizeMap[size], className)}
                {...props}
            />
        );
    }
);

PremiumIconButton.displayName = 'PremiumIconButton';

// ============================================================================
// Button Group
// ============================================================================

export interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
    return (
        <div
            className={cn(
                'inline-flex',
                '[&>*:first-child]:rounded-r-none',
                '[&>*:last-child]:rounded-l-none',
                '[&>*:not(:first-child):not(:last-child)]:rounded-none',
                '[&>*:not(:first-child)]:-ml-px',
                className
            )}
            data-slot="button-group"
        >
            {children}
        </div>
    );
}
