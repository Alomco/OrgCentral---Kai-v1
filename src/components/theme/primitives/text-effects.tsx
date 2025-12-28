/**
 * ✨ Gradient Text Components
 * 
 * Animated gradient text effects for premium headings.
 * Server Component - CSS-first animation.
 * 
 * @module components/theme/primitives/text-effects
 */

import type { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';
import styles from './text-effects.module.css';

// ============================================================================
// Types
// ============================================================================

export interface GradientTextProps {
    children: ReactNode;
    /** Gradient color scheme */
    gradient?: 'primary' | 'vibrant' | 'rainbow';
    /** Enable animation */
    animated?: boolean;
    /** Wrapper element */
    as?: ElementType;
    /** Additional styling */
    className?: string;
}

// ============================================================================
// Gradient Text Component
// ============================================================================

/**
 * Text with animated gradient color effect.
 */
export function GradientText({
    children,
    gradient = 'primary',
    animated = false,
    as: Component = 'span',
    className,
}: GradientTextProps) {
    const gradientClass = {
        primary: styles.gradientPrimary,
        vibrant: styles.gradientVibrant,
        rainbow: styles.gradientRainbow,
    }[gradient];

    return (
        <Component
            className={cn(
                styles.gradientText,
                gradientClass,
                animated && styles.animated,
                className,
            )}
        >
            {children}
        </Component>
    );
}
