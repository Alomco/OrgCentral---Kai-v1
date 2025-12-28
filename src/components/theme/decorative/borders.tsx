/**
 * 🌀 Animated Border Components
 * 
 * Premium border wrappers with rotating gradients and neon effects.
 * Server Components - no client JS required for CSS animations.
 * 
 * @module components/theme/decorative/borders
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './borders.module.css';

// ============================================================================
// Types
// ============================================================================

export interface BorderCardProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

// ============================================================================
// Rotating Border Card
// ============================================================================

/**
 * Card with a continuously rotating gradient border.
 * Creates a mesmerizing effect using CSS @property animation.
 */
export function RotatingBorderCard({
    children,
    className,
    contentClassName,
}: BorderCardProps) {
    return (
        <div className={cn(styles.rotatingBorderWrapper, className)}>
            <div className={cn(styles.rotatingBorderContent, 'p-6', contentClassName)}>
                {children}
            </div>
        </div>
    );
}

// ============================================================================
// Neon Border Card
// ============================================================================

/**
 * Card with a pulsing neon glow effect.
 * Uses box-shadow animation for cyberpunk aesthetic.
 */
export function NeonBorderCard({
    children,
    className,
    contentClassName,
}: BorderCardProps) {
    return (
        <div className={cn(styles.neonBorder, 'p-6', className, contentClassName)}>
            {children}
        </div>
    );
}

// ============================================================================
// Gradient Border Card
// ============================================================================

/**
 * Card with a static gradient border.
 * More subtle than rotating, good for persistent accent.
 */
export function GradientBorderCard({
    children,
    className,
    contentClassName,
}: BorderCardProps) {
    return (
        <div className={cn(styles.gradientBorderWrapper, className)}>
            <div className={cn(styles.gradientBorderContent, 'p-6', contentClassName)}>
                {children}
            </div>
        </div>
    );
}
