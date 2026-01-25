/**
 * 🎯 Theme-Aware Interactive Components
 * 
 * Button and interactive element variants with theme adaptation.
 * Following SOLID (SRP, OCP, LSP) with <250 LOC.
 * 
 * @module components/theme/primitives
 */

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Futuristic Button Component (SRP - Single Responsibility)
// ============================================================================

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none disabled:pointer-events-none disabled:opacity-50 rounded-[var(--ui-border-radius)] border border-transparent',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow-[var(--ui-card-shadow)]',
                destructive: 'bg-destructive text-destructive-foreground shadow-[var(--ui-card-shadow)]',
                outline: 'bg-transparent border-border text-foreground hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground',
                ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                gradient: 'bg-[var(--app-gradient-primary)] text-primary-foreground shadow-[var(--ui-card-shadow)]',
                glass: 'bg-[var(--ui-surface-fill)] text-foreground backdrop-blur-[var(--ui-backdrop-blur)]',
                neon: 'bg-transparent border-primary/40 text-primary shadow-[var(--ui-card-shadow)]',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4 text-sm',
                lg: 'h-11 px-6 text-base',
                xl: 'h-12 px-8 text-lg',
                icon: 'h-10 w-10',
                'icon-sm': 'h-8 w-8',
                'icon-lg': 'h-12 w-12',
            },
            animation: {
                none: '',
                pulse: 'hover:animate-pulse-glow',
                shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            animation: 'none',
        },
    }
);

export interface ThemeButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const ThemeButton = forwardRef<HTMLButtonElement, ThemeButtonProps>(
    ({ className, variant, size, animation, ...props }, ref) => {
        return (
            <button
                data-slot="button"
                className={cn(buttonVariants({ variant, size, animation }), className)}
                ref={ref}
                {...props}
            />
        );
    }
);

ThemeButton.displayName = 'ThemeButton';

// ============================================================================
// Icon Button (LSP - Liskov Substitution)
// ============================================================================

export interface ThemeIconButtonProps extends Omit<ThemeButtonProps, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    'aria-label': string;
}

export const ThemeIconButton = forwardRef<HTMLButtonElement, ThemeIconButtonProps>(
    ({ className, size = 'md', ...props }, ref) => {
        const iconSize = size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon';

        return (
            <ThemeButton
                className={cn('rounded-full', className)}
                size={iconSize}
                ref={ref}
                {...props}
            />
        );
    }
);

ThemeIconButton.displayName = 'ThemeIconButton';

// ============================================================================
// Badge Component (OCP - Open/Closed)
// ============================================================================

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ease-out',
    {
        variants: {
            variant: {
                default: 'bg-[oklch(var(--primary)/0.1)] text-[oklch(var(--primary))] shadow-[0_0_0_1px_oklch(var(--primary)/0.2)]',
                secondary: 'bg-[oklch(var(--secondary)/0.9)] text-[oklch(var(--secondary-foreground))] shadow-[0_0_0_1px_oklch(var(--border)/0.3)]',
                destructive: 'bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))] shadow-[0_0_0_1px_oklch(var(--status-danger)/0.2)]',
                outline: 'bg-transparent text-[oklch(var(--foreground))] shadow-[0_0_0_1px_oklch(var(--border)/0.4)]',
                success: 'bg-[oklch(var(--status-success)/0.12)] text-[oklch(var(--status-success))] shadow-[0_0_0_1px_oklch(var(--status-success)/0.2)]',
                warning: 'bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))] shadow-[0_0_0_1px_oklch(var(--status-warning)/0.22)]',
                info: 'bg-[oklch(var(--status-info)/0.12)] text-[oklch(var(--status-info))] shadow-[0_0_0_1px_oklch(var(--status-info)/0.2)]',
                gradient: 'bg-[var(--app-gradient-primary)] text-primary-foreground shadow-[var(--ui-card-shadow)]',
                glow: 'bg-[oklch(var(--primary)/0.2)] text-[oklch(var(--primary))] shadow-[0_0_0_1px_oklch(var(--primary)/0.35),0_10px_20px_-16px_oklch(var(--primary)/0.3)]',
            },
            size: {
                sm: 'text-[10px] px-2 py-0.5',
                md: 'text-xs px-2.5 py-0.5',
                lg: 'text-sm px-3 py-1',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface ThemeBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

export function ThemeBadge({ className, variant, size, ...props }: ThemeBadgeProps) {
    return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
