/**
 * 🔢 Z-Index Token System
 *
 * Single source of truth for all z-index values in the application.
 * This ensures consistent layering and prevents floating element overlap.
 *
 * HIERARCHY (lowest to highest):
 * - BASE (0): Default content layer
 * - DROPDOWN (100): Dropdowns, popovers, hover cards, context menus, selects
 * - STICKY (200): Sticky headers, sidebars, navigation
 * - OVERLAY (300): Modal backdrops, sheet overlays
 * - MODAL (400): Dialogs, sheets, alert dialogs, drawers
 * - TOAST (500): Toast notifications
 * - TOOLTIP (600): Tooltips - always above everything except dev widgets
 * - DEV_WIDGET (700): Development widgets (security, theme)
 * - MAX (9999): Emergency override
 *
 * @module lib/z-index
 */

export const Z_INDEX = {
    /** Default content layer */
    BASE: 0,
    /** Dropdowns, popovers, hover cards, context menus, selects */
    DROPDOWN: 100,
    /** Sticky headers, sidebars, navigation */
    STICKY: 200,
    /** Modal backdrops, sheet overlays */
    OVERLAY: 300,
    /** Dialogs, sheets, alert dialogs, drawers */
    MODAL: 400,
    /** Toast notifications */
    TOAST: 500,
    /** Tooltips - always above everything else in normal UI */
    TOOLTIP: 600,
    /** Development widgets (security, theme) */
    DEV_WIDGET: 700,
    /** Emergency override - use sparingly */
    MAX: 9999,
} as const;

export type ZIndexToken = keyof typeof Z_INDEX;
export type ZIndexValue = (typeof Z_INDEX)[ZIndexToken];

/**
 * CSS custom property names for z-index values.
 * Use these in inline styles or CSS-in-JS.
 */
export const Z_INDEX_VAR = {
    BASE: 'var(--z-base)',
    DROPDOWN: 'var(--z-dropdown)',
    STICKY: 'var(--z-sticky)',
    OVERLAY: 'var(--z-overlay)',
    MODAL: 'var(--z-modal)',
    TOAST: 'var(--z-toast)',
    TOOLTIP: 'var(--z-tooltip)',
    DEV_WIDGET: 'var(--z-dev-widget)',
    MAX: 'var(--z-max)',
} as const;

/**
 * Tailwind-compatible arbitrary value classes for z-index.
 * Use these in className props.
 */
export const Z_INDEX_CLASS = {
    BASE: '[z-index:var(--z-base)]',
    DROPDOWN: '[z-index:var(--z-dropdown)]',
    STICKY: '[z-index:var(--z-sticky)]',
    OVERLAY: '[z-index:var(--z-overlay)]',
    MODAL: '[z-index:var(--z-modal)]',
    TOAST: '[z-index:var(--z-toast)]',
    TOOLTIP: '[z-index:var(--z-tooltip)]',
    DEV_WIDGET: '[z-index:var(--z-dev-widget)]',
    MAX: '[z-index:var(--z-max)]',
} as const;
