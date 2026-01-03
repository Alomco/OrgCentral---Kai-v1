/**
 * 🏛️ Abstract Base UI Component
 * 
 * Object-oriented base class that enforces design tokens through inheritance.
 * All UI components extending this class will have consistent styling.
 * 
 * @module classes/ui/BaseUIComponent
 */

import { type ReactNode, createElement } from 'react';
import { cn } from '@/lib/utils';
import { cardTokens, interactiveTokens, type DesignTokens } from './design-tokens';

// ============================================================================
// Abstract Base Class
// ============================================================================

/**
 * Abstract base class for UI components.
 * Enforces consistent styling through design tokens.
 * 
 * @example
 * ```tsx
 * class MyCard extends BaseUIComponent<{ title: string }> {
 *   renderContent() {
 *     return createElement('h2', null, this.props.title);
 *   }
 * }
 * 
 * // Usage:
 * new MyCard({ title: "Hello" }).render()
 * ```
 */
export abstract class BaseUIComponent<Props extends object = object> {
    protected props: Props;

    /**
     * Design tokens enforced on all instances.
     * Override in subclasses to customize while maintaining structure.
     */
    protected tokens: DesignTokens = {
        backgroundColor: cardTokens.backgroundColor,
        borderRadius: cardTokens.borderRadius,
        shadow: cardTokens.shadow,
        padding: cardTokens.padding,
        transition: cardTokens.transition,
    };

    /**
     * Interactive tokens for hover/active/focus states.
     * Set to null to disable interactivity.
     */
    protected interactive = false;

    /**
     * Additional classes to apply to the wrapper.
     */
    protected wrapperClasses = '';

    /**
     * HTML tag for the wrapper element.
     */
    protected wrapperTag: keyof HTMLElementTagNameMap = 'div';

    constructor(props: Props) {
        this.props = props;
    }

    // ========================================================================
    // Style Builders
    // ========================================================================

    /**
     * Build the base styles from design tokens.
     * Merges tokens with any custom classes.
     */
    protected getBaseStyles(extraClasses?: string): string {
        const baseStyles = cn(
            this.tokens.backgroundColor,
            this.tokens.borderRadius,
            this.tokens.shadow,
            this.tokens.padding,
            this.tokens.transition,
            this.wrapperClasses
        );

        if (this.interactive) {
            return cn(
                baseStyles,
                interactiveTokens.hover,
                interactiveTokens.active,
                interactiveTokens.focus,
                'cursor-pointer',
                extraClasses
            );
        }

        return cn(baseStyles, extraClasses);
    }

    // ========================================================================
    // Abstract Methods (MUST be implemented by subclasses)
    // ========================================================================

    /**
     * Render the component content.
     * This method MUST be implemented by all subclasses.
     */
    abstract renderContent(): ReactNode;

    // ========================================================================
    // Render Method
    // ========================================================================

    /**
     * Render the complete component.
     * Wraps content in a styled container with design tokens applied.
     */
    public render(): ReactNode {
        const className = this.getBaseStyles(
            (this.props as Record<string, unknown>).className as string | undefined
        );

        return createElement(
            this.wrapperTag,
            {
                className,
                'data-slot': 'card',
            },
            this.renderContent()
        );
    }
}

// ============================================================================
// Specialized Base Classes
// ============================================================================

const DEFAULT_CARD_BACKGROUND = 'bg-card';
const SMOOTH_TRANSITION = 'transition-all duration-200 ease-out';

/**
 * Base class for card components.
 * Pre-configured with card design tokens.
 */
export abstract class BaseCardComponent<Props extends object = object> extends BaseUIComponent<Props> {
    protected override tokens: DesignTokens = {
        backgroundColor: DEFAULT_CARD_BACKGROUND,
        borderRadius: 'rounded-xl',
        shadow: 'shadow-md',
        padding: 'p-6',
        transition: SMOOTH_TRANSITION,
    };
}

/**
 * Base class for interactive cards (with hover effects).
 */
export abstract class BaseInteractiveCard<Props extends object = object> extends BaseCardComponent<Props> {
    protected override interactive = true;
}

/**
 * Base class for stat widgets.
 */
export abstract class BaseStatWidget<Props extends object = object> extends BaseCardComponent<Props> {
    protected override tokens: DesignTokens = {
        backgroundColor: DEFAULT_CARD_BACKGROUND,
        borderRadius: 'rounded-xl',
        shadow: 'shadow-sm',
        padding: 'p-4',
        transition: SMOOTH_TRANSITION,
    };
}

/**
 * Base class for panel components.
 */
export abstract class BasePanelComponent<Props extends object = object> extends BaseUIComponent<Props> {
    protected override tokens: DesignTokens = {
        backgroundColor: DEFAULT_CARD_BACKGROUND,
        borderRadius: 'rounded-lg',
        shadow: 'shadow-lg',
        padding: 'p-6',
        transition: SMOOTH_TRANSITION,
    };
}
