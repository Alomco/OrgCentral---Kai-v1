/**
 * 🎨 UI Style Token System
 * 
 * Defines visual style presets that layer on top of color themes.
 * Used with [data-ui-style="*"] CSS selectors for DOM-level theming.
 * 
 * @module server/theme/ui-style-presets
 */

// ============================================================================
// Types
// ============================================================================

export interface UiStyleTokens {
    /** Backdrop blur level */
    backdropBlur: '0' | '4px' | '8px' | '12px' | '16px';
    /** Card shadow intensity */
    cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';
    /** Border radius scale */
    borderRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Glow intensity (0-1 scale) */
    glowIntensity: '0' | '0.15' | '0.25' | '0.35' | '0.5';
    /** Transition duration */
    transitionDuration: '150ms' | '200ms' | '250ms' | '300ms';
    /** Transition easing */
    transitionEasing: 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.4, 0, 0.2, 1)';
    /** Border opacity (0 = borderless) */
    borderOpacity: '0' | '0.1' | '0.2' | '0.3' | '0.5' | '1';
    /** Card background opacity */
    cardOpacity: '0.95' | '1';
    /** Hover transform scale */
    hoverScale: '1' | '1.01' | '1.02' | '1.03';
    /** Hover Y-axis lift */
    hoverLift: '0px' | '-1px' | '-2px' | '-4px';
    /** Active/pressed scale */
    activeScale: '1' | '0.99' | '0.98' | '0.97';
    /** Focus ring width */
    focusRingWidth: '2px' | '3px' | '4px';
    /** Focus ring offset */
    focusRingOffset: '1px' | '2px' | '3px';
    /** Border width (0px = borderless) */
    borderWidth: '0px' | '1px' | '2px';
    /** Animation intensity */
    animationIntensity: 'none' | 'subtle' | 'expressive';
}

export interface UiStylePreset {
    id: string;
    name: string;
    emoji: string;
    description: string;
    tokens: UiStyleTokens;
}

// ============================================================================
// Style Presets
// ============================================================================

export const uiStylePresets: Record<string, UiStylePreset> = {
    'glass-neon': {
        id: 'glass-neon',
        name: 'Glass Neon',
        emoji: '🔮',
        description: 'Glassmorphism with neon glows. Modern tech aesthetic.',
        tokens: {
            backdropBlur: '16px',
            cardShadow: 'glow',
            borderRadius: 'lg',
            glowIntensity: '0.35',
            transitionDuration: '200ms',
            transitionEasing: 'ease-out',
            borderOpacity: '0.2',
            cardOpacity: '0.95',
            hoverScale: '1.02',
            hoverLift: '-2px',
            activeScale: '0.98',
            focusRingWidth: '3px',
            focusRingOffset: '2px',
            borderWidth: '2px',
            animationIntensity: 'expressive',
        },
    },
    'clean-corporate': {
        id: 'clean-corporate',
        name: 'Clean Corporate',
        emoji: '📋',
        description: 'Minimal and professional. Traditional enterprise.',
        tokens: {
            backdropBlur: '0',
            cardShadow: 'sm',
            borderRadius: 'sm',
            glowIntensity: '0',
            transitionDuration: '150ms',
            transitionEasing: 'ease-out',
            borderOpacity: '0.3',
            cardOpacity: '1',
            hoverScale: '1',
            hoverLift: '0px',
            activeScale: '0.99',
            focusRingWidth: '2px',
            focusRingOffset: '1px',
            borderWidth: '1px',
            animationIntensity: 'subtle',
        },
    },
    'soft-neutral': {
        id: 'soft-neutral',
        name: 'Soft Neutral',
        emoji: '🌿',
        description: 'Warm shadows and rounded corners. Approachable.',
        tokens: {
            backdropBlur: '8px',
            cardShadow: 'md',
            borderRadius: '2xl',
            glowIntensity: '0.15',
            transitionDuration: '250ms',
            transitionEasing: 'ease-in-out',
            borderOpacity: '0.1',
            cardOpacity: '1',
            hoverScale: '1.01',
            hoverLift: '-1px',
            activeScale: '0.99',
            focusRingWidth: '3px',
            focusRingOffset: '2px',
            borderWidth: '0px',
            animationIntensity: 'subtle',
        },
    },
    'bold-amoled': {
        id: 'bold-amoled',
        name: 'Bold AMOLED',
        emoji: '⚡',
        description: 'High contrast with vibrant accents. Dark mode optimized.',
        tokens: {
            backdropBlur: '0',
            cardShadow: 'xl',
            borderRadius: 'md',
            glowIntensity: '0.5',
            transitionDuration: '150ms',
            transitionEasing: 'ease-out',
            borderOpacity: '0.5',
            cardOpacity: '1',
            hoverScale: '1.03',
            hoverLift: '-4px',
            activeScale: '0.97',
            focusRingWidth: '4px',
            focusRingOffset: '2px',
            borderWidth: '2px',
            animationIntensity: 'expressive',
        },
    },
    'material-motion': {
        id: 'material-motion',
        name: 'Material Motion',
        emoji: '🎯',
        description: 'Elevation-based shadows with expressive motion.',
        tokens: {
            backdropBlur: '4px',
            cardShadow: 'lg',
            borderRadius: 'xl',
            glowIntensity: '0',
            transitionDuration: '300ms',
            transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            borderOpacity: '0.2',
            cardOpacity: '1',
            hoverScale: '1.01',
            hoverLift: '-2px',
            activeScale: '0.98',
            focusRingWidth: '2px',
            focusRingOffset: '2px',
            borderWidth: '1px',
            animationIntensity: 'expressive',
        },
    },
} as const;

export type UiStyleKey = keyof typeof uiStylePresets;
export const uiStyleKeys = Object.keys(uiStylePresets);

export const defaultUiStyle: UiStyleKey = 'clean-corporate';

/**
 * Get CSS custom properties for a UI style preset.
 * Returns a dictionary of CSS variable names and values.
 */
export function getUiStyleCssVariables(styleKey: UiStyleKey): Record<string, string> {
    const preset = uiStylePresets[styleKey];
    const { tokens } = preset;

    return {
        '--ui-backdrop-blur': tokens.backdropBlur,
        '--ui-card-shadow': `var(--shadow-${tokens.cardShadow})`,
        '--ui-border-radius': `var(--radius-${tokens.borderRadius})`,
        '--ui-glow-intensity': tokens.glowIntensity,
        '--ui-transition-duration': tokens.transitionDuration,
        '--ui-transition-easing': tokens.transitionEasing,
        '--ui-border-opacity': tokens.borderOpacity,
        '--ui-card-opacity': tokens.cardOpacity,
        '--ui-hover-scale': tokens.hoverScale,
        '--ui-hover-lift': tokens.hoverLift,
        '--ui-active-scale': tokens.activeScale,
        '--ui-focus-ring-width': tokens.focusRingWidth,
        '--ui-focus-ring-offset': tokens.focusRingOffset,
        '--ui-border-width': tokens.borderWidth,
        '--ui-animation-intensity': tokens.animationIntensity,
    };
}

export function isUiStyleKey(value: string | null): value is UiStyleKey {
    return Boolean(value && Object.prototype.hasOwnProperty.call(uiStylePresets, value));
}

