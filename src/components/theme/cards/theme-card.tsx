/**
 * 🎴 Theme-Aware Card Components
 * 
 * Professional card designs that adapt to tenant themes.
 * Following SOLID with PPR/Suspense support <250 LOC.
 * 
 * @module components/theme/cards
 */

import { type ReactNode, type ElementType, type CSSProperties } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Base Card Component (SRP)
// ============================================================================

const cardVariants = cva(
    'text-card-foreground',
    {
        variants: {
            variant: {
                default: '',
                elevated: '',
                glass: '',
                outline: '',
                gradient: '',
                glow: '',
                neon: '',
            },
            padding: {
                none: '',
                sm: 'p-4',
                md: 'p-6',
                lg: 'p-8',
                xl: 'p-10',
            },
            hover: {
                none: '',
                lift: '',
                glow: '',
                scale: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
            hover: 'none',
        },
    }
);

type CardVariant = NonNullable<VariantProps<typeof cardVariants>['variant']>;
type CardHover = NonNullable<VariantProps<typeof cardVariants>['hover']>;
type CssVariableProperty = `--${string}`;
type CssVariableStyles = Partial<Record<CssVariableProperty, string>>;
type CardStyleOverrides = CSSProperties & CssVariableStyles;
type CardSurface = 'container' | 'item' | 'interactive';

const cardSurfaceByVariant: Record<CardVariant, CardSurface> = {
    default: 'container',
    elevated: 'interactive',
    glass: 'item',
    outline: 'container',
    gradient: 'container',
    glow: 'interactive',
    neon: 'interactive',
};

const cardStyleOverrides: Partial<Record<CardVariant, CardStyleOverrides>> = {
    outline: {
        '--ui-surface-bg': 'transparent',
        '--ui-surface-shadow': 'none',
    },
    gradient: {
        '--ui-surface-bg': 'var(--app-gradient-primary)',
    },
};

export interface ThemeCardProps extends VariantProps<typeof cardVariants> {
    children: ReactNode;
    className?: string;
    as?: ElementType;
}

export function ThemeCard({
    children,
    className,
    variant,
    padding,
    hover,
    as: Component = 'div',
}: ThemeCardProps) {
    const resolvedVariant = (variant ?? 'default') as CardVariant;
    const resolvedHover = (hover ?? 'none') as CardHover;
    const isInteractive = resolvedHover !== 'none' || resolvedVariant === 'elevated' || resolvedVariant === 'glow' || resolvedVariant === 'neon';
    const dataUiSurface = cardSurfaceByVariant[resolvedVariant];
    const styleOverrides = cardStyleOverrides[resolvedVariant];
    const Comp = Component;
    return (
        <Comp
            data-slot="card"
            data-ui-surface={dataUiSurface}
            data-ui-interactive={isInteractive ? 'true' : undefined}
            className={cn(cardVariants({ variant, padding, hover }), className)}
            style={styleOverrides}
        >
            {children}
        </Comp>
    );
}

// ============================================================================
// Card Header (ISP - Interface Segregation)
// ============================================================================

export interface ThemeCardHeaderProps {
    children: ReactNode;
    className?: string;
    accent?: boolean;
}

export function ThemeCardHeader({ children, className, accent }: ThemeCardHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1.5 border-b border-border/50 pb-4 mb-4',
                accent && 'border-l-4 border-l-primary pl-4',
                className
            )}
        >
            {children}
        </div>
    );
}

// ============================================================================
// Card Title (Typography)
// ============================================================================

const cardTitleVariants = cva(
    'font-semibold leading-none tracking-tight',
    {
        variants: {
            size: {
                sm: 'text-base',
                md: 'text-lg',
                lg: 'text-xl',
                xl: 'text-2xl',
            },
            gradient: {
                true: 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
                false: 'text-foreground',
            },
        },
        defaultVariants: {
            size: 'lg',
            gradient: false,
        },
    }
);

export interface ThemeCardTitleProps extends VariantProps<typeof cardTitleVariants> {
    children: ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function ThemeCardTitle({
    children,
    className,
    size,
    gradient,
    as: Component = 'h3',
}: ThemeCardTitleProps) {
    return (
        <Component className={cn(cardTitleVariants({ size, gradient }), className)}>
            {children}
        </Component>
    );
}

// ============================================================================
// Card Description
// ============================================================================

export interface ThemeCardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function ThemeCardDescription({ children, className }: ThemeCardDescriptionProps) {
    return (
        <p className={cn('text-sm text-muted-foreground leading-relaxed', className)}>
            {children}
        </p>
    );
}

// ============================================================================
// Card Content
// ============================================================================

export interface ThemeCardContentProps {
    children: ReactNode;
    className?: string;
}

export function ThemeCardContent({ children, className }: ThemeCardContentProps) {
    return <div className={cn('space-y-4', className)}>{children}</div>;
}

// ============================================================================
// Card Footer
// ============================================================================

export interface ThemeCardFooterProps {
    children: ReactNode;
    className?: string;
    divided?: boolean;
}

export function ThemeCardFooter({ children, className, divided }: ThemeCardFooterProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 mt-4',
                divided && 'border-t border-border/50 pt-4',
                className
            )}
        >
            {children}
        </div>
    );
}
