/**
 * 🎬 Motion Wrapper Components
 * 
 * CSS-first enter animations for premium UI transitions.
 * Server Components - no client JS required.
 * 
 * @module components/theme/primitives/motion
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './motion.module.css';

// ============================================================================
// Types
// ============================================================================

export interface MotionProps {
    children: ReactNode;
    className?: string;
    /** Delay in multiples of 100ms (1-5) */
    delay?: 1 | 2 | 3 | 4 | 5;
}

type DelayKey = 'delay100' | 'delay200' | 'delay300' | 'delay400' | 'delay500';

function getDelayClass(delay?: number): string {
    if (!delay) {return '';}
    const key = `delay${String(delay * 100)}` as DelayKey;
    return styles[key] ?? '';
}

// ============================================================================
// Motion Components
// ============================================================================

/**
 * Fade in animation wrapper.
 */
export function FadeIn({ children, className, delay }: MotionProps) {
    return (
        <div className={cn(styles.fadeIn, getDelayClass(delay), className)}>
            {children}
        </div>
    );
}

/**
 * Slide up from below animation.
 */
export function SlideUp({ children, className, delay }: MotionProps) {
    return (
        <div className={cn(styles.slideUp, getDelayClass(delay), className)}>
            {children}
        </div>
    );
}

/**
 * Slide down from above animation.
 */
export function SlideDown({ children, className, delay }: MotionProps) {
    return (
        <div className={cn(styles.slideDown, getDelayClass(delay), className)}>
            {children}
        </div>
    );
}

/**
 * Scale in from smaller animation.
 */
export function ScaleIn({ children, className, delay }: MotionProps) {
    return (
        <div className={cn(styles.scaleIn, getDelayClass(delay), className)}>
            {children}
        </div>
    );
}

/**
 * Bounce in with overshoot animation.
 */
export function BounceIn({ children, className, delay }: MotionProps) {
    return (
        <div className={cn(styles.bounceIn, getDelayClass(delay), className)}>
            {children}
        </div>
    );
}
