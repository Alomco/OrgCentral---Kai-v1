/**
 * 📦 Icon Container Component
 * 
 * Premium icon wrappers with gradient/glass/glow variants.
 * Server Component with CVA.
 * 
 * @module components/theme/primitives/icon-container
 */

import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Icon Container Variants
// ============================================================================

const iconContainerVariants = cva(
    'inline-flex items-center justify-center transition-all duration-300',
    {
        variants: {
            variant: {
                solid: 'bg-primary text-primary-foreground',
                gradient: 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25',
                glass: 'bg-card/50 backdrop-blur-md border border-border/30 text-foreground',
                glow: 'bg-primary/15 text-primary border-2 border-primary/30 shadow-lg shadow-primary/20',
                muted: 'bg-muted text-muted-foreground',
                outline: 'border-2 border-border bg-transparent text-foreground',
            },
            size: {
                sm: 'p-1.5 rounded-md [&>svg]:size-3.5',
                md: 'p-2 rounded-lg [&>svg]:size-4',
                lg: 'p-2.5 rounded-xl [&>svg]:size-5',
                xl: 'p-3 rounded-xl [&>svg]:size-6',
            },
            interactive: {
                true: 'cursor-pointer hover:scale-105 active:scale-95',
                false: '',
            },
        },
        compoundVariants: [
            { variant: 'solid', interactive: true, className: 'hover:bg-primary/90' },
            { variant: 'gradient', interactive: true, className: 'hover:shadow-xl hover:shadow-primary/35' },
            { variant: 'glass', interactive: true, className: 'hover:bg-card/70 hover:border-border/50' },
            { variant: 'glow', interactive: true, className: 'hover:bg-primary/25 hover:shadow-xl hover:shadow-primary/30' },
        ],
        defaultVariants: {
            variant: 'solid',
            size: 'md',
            interactive: false,
        },
    }
);

// ============================================================================
// Types
// ============================================================================

export interface IconContainerProps extends VariantProps<typeof iconContainerVariants> {
    children: ReactNode;
    className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Premium container for icons with multiple visual styles.
 */
export function IconContainer({
    children,
    variant,
    size,
    interactive,
    className,
}: IconContainerProps) {
    return (
        <div className={cn(iconContainerVariants({ variant, size, interactive }), className)}>
            {children}
        </div>
    );
}
