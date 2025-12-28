/**
 * 📝 Premium Typography System
 * 
 * Theme-aware headings and text with gradient options.
 * Server Components with CVA variants.
 * 
 * @module components/theme/primitives/typography
 */

import type { ReactNode, ElementType } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Heading
// ============================================================================

const headingVariants = cva('tracking-tight', {
    variants: {
        size: {
            h1: 'text-4xl lg:text-5xl',
            h2: 'text-3xl lg:text-4xl',
            h3: 'text-2xl lg:text-3xl',
            h4: 'text-xl lg:text-2xl',
            h5: 'text-lg lg:text-xl',
            h6: 'text-base lg:text-lg',
        },
        weight: {
            normal: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
            black: 'font-black',
        },
        gradient: {
            none: 'text-foreground',
            primary: 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
            vibrant: 'bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_100%]',
            soft: 'bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent',
        },
    },
    defaultVariants: {
        size: 'h2',
        weight: 'bold',
        gradient: 'none',
    },
});

export interface HeadingProps extends VariantProps<typeof headingVariants> {
    children: ReactNode;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    className?: string;
}

/**
 * Premium heading with gradient text options.
 */
export function Heading({
    children,
    as,
    size,
    weight,
    gradient,
    className,
}: HeadingProps) {
    const Component: ElementType = as ?? size ?? 'h2';

    return (
        <Component className={cn(headingVariants({ size, weight, gradient }), className)}>
            {children}
        </Component>
    );
}

// ============================================================================
// Text
// ============================================================================

const textVariants = cva('leading-relaxed', {
    variants: {
        size: {
            xs: 'text-xs',
            sm: 'text-sm',
            base: 'text-base',
            lg: 'text-lg',
        },
        color: {
            default: 'text-foreground',
            muted: 'text-muted-foreground',
            primary: 'text-primary',
            accent: 'text-accent',
        },
        weight: {
            normal: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
        },
    },
    defaultVariants: {
        size: 'base',
        color: 'default',
        weight: 'normal',
    },
});

export interface TextProps extends VariantProps<typeof textVariants> {
    children: ReactNode;
    as?: 'p' | 'span' | 'div';
    className?: string;
}

/**
 * Body text with size and color variants.
 */
export function Text({
    children,
    as: Component = 'p',
    size,
    color,
    weight,
    className,
}: TextProps) {
    return (
        <Component className={cn(textVariants({ size, color, weight }), className)}>
            {children}
        </Component>
    );
}

// ============================================================================
// Caption
// ============================================================================

export interface CaptionProps {
    children: ReactNode;
    className?: string;
}

/**
 * Small caption text for labels and hints.
 */
export function Caption({ children, className }: CaptionProps) {
    return (
        <span className={cn('text-xs text-muted-foreground font-medium uppercase tracking-wider', className)}>
            {children}
        </span>
    );
}
