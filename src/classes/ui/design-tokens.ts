/**
 * 🎨 Design Tokens for Class-Based UI System
 * 
 * Centralized design tokens that integrate with CSS variables from ui-styles.css.
 * These tokens are the single source of truth for UI styling.
 * 
 * @module classes/ui/design-tokens
 */

import { cn } from '@/lib/utils';

// ============================================================================
// Token Interfaces
// ============================================================================

export interface DesignTokens {
    /** Background color class */
    backgroundColor: string;
    /** Border radius class (even if border is invisible) */
    borderRadius: string;
    /** Shadow class for elevation */
    shadow: string;
    /** Padding class */
    padding: string;
    /** Transition classes */
    transition: string;
}

export interface InteractiveTokens {
    /** Hover effect classes */
    hover: string;
    /** Active/pressed effect classes */
    active: string;
    /** Focus effect classes */
    focus: string;
}

export interface LayoutTokens {
    /** Container max-width */
    containerWidth: string;
    /** Gap between elements */
    gap: string;
}

// ============================================================================
// Default Tokens (Borderless, Solid Backgrounds)
// ============================================================================

/**
 * Card design tokens - for elevated content areas
 * Uses shadows for elevation instead of borders (borderless design)
 */
export const cardTokens: DesignTokens = {
    backgroundColor: 'bg-card',
    borderRadius: 'rounded-xl',
    shadow: 'shadow-md',
    padding: 'p-6',
    transition: 'transition-all duration-200 ease-out',
};

/**
 * Popover design tokens - for floating content
 */
export const popoverTokens: DesignTokens = {
    backgroundColor: 'bg-popover',
    borderRadius: 'rounded-xl',
    shadow: 'shadow-xl',
    padding: 'p-4',
    transition: 'transition-all duration-200 ease-out',
};

/**
 * Button design tokens
 */
export const buttonTokens: DesignTokens = {
    backgroundColor: 'bg-primary',
    borderRadius: 'rounded-lg',
    shadow: 'shadow-sm hover:shadow-md',
    padding: 'px-4 py-2',
    transition: 'transition-all duration-150 ease-out',
};

/**
 * Interactive tokens for hover/active/focus states
 */
export const interactiveTokens: InteractiveTokens = {
    hover: 'hover:scale-[1.02] hover:-translate-y-0.5',
    active: 'active:scale-[0.98]',
    focus: 'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:outline-none',
};

/**
 * Layout tokens for consistent spacing
 */
export const layoutTokens: LayoutTokens = {
    containerWidth: 'max-w-7xl mx-auto',
    gap: 'gap-6',
};

// ============================================================================
// Token Helpers
// ============================================================================

/**
 * Build base card styles from tokens
 */
export function getCardStyles(extraClasses?: string): string {
    return cn(
        cardTokens.backgroundColor,
        cardTokens.borderRadius,
        cardTokens.shadow,
        cardTokens.padding,
        cardTokens.transition,
        extraClasses
    );
}

/**
 * Build popover styles from tokens
 */
export function getPopoverStyles(extraClasses?: string): string {
    return cn(
        popoverTokens.backgroundColor,
        popoverTokens.borderRadius,
        popoverTokens.shadow,
        popoverTokens.padding,
        popoverTokens.transition,
        extraClasses
    );
}

/**
 * Build interactive card styles (with hover/active effects)
 */
export function getInteractiveCardStyles(extraClasses?: string): string {
    return cn(
        getCardStyles(),
        interactiveTokens.hover,
        interactiveTokens.active,
        interactiveTokens.focus,
        'cursor-pointer',
        extraClasses
    );
}

/**
 * Build button styles from tokens
 */
export function getButtonStyles(extraClasses?: string): string {
    return cn(
        buttonTokens.backgroundColor,
        buttonTokens.borderRadius,
        buttonTokens.shadow,
        buttonTokens.padding,
        buttonTokens.transition,
        interactiveTokens.hover,
        interactiveTokens.active,
        interactiveTokens.focus,
        'text-primary-foreground font-medium',
        extraClasses
    );
}
