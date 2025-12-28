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
    cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'glow';
    /** Border radius scale */
    borderRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Glow intensity (0-1 scale) */
    glowIntensity: '0' | '0.15' | '0.25' | '0.35' | '0.5';
    /** Transition duration */
    transitionDuration: '150ms' | '200ms' | '250ms' | '300ms';
    /** Transition easing */
    transitionEasing: 'ease-out' | 'ease-in-out' | 'cubic-bezier(0.4, 0, 0.2, 1)';
    /** Border opacity */
    borderOpacity: '0.1' | '0.2' | '0.3' | '0.5' | '1';
    /** Card background opacity */
    cardOpacity: '0.8' | '0.9' | '0.95' | '1';
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
            backdropBlur: '12px',
            cardShadow: 'glow',
            borderRadius: 'lg',
            glowIntensity: '0.35',
            transitionDuration: '200ms',
            transitionEasing: 'ease-out',
            borderOpacity: '0.2',
            cardOpacity: '0.9',
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
            borderRadius: 'md',
            glowIntensity: '0',
            transitionDuration: '150ms',
            transitionEasing: 'ease-out',
            borderOpacity: '0.5',
            cardOpacity: '1',
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
            borderRadius: 'xl',
            glowIntensity: '0.15',
            transitionDuration: '250ms',
            transitionEasing: 'ease-in-out',
            borderOpacity: '0.2',
            cardOpacity: '0.95',
        },
    },
    'bold-amoled': {
        id: 'bold-amoled',
        name: 'Bold AMOLED',
        emoji: '⚡',
        description: 'High contrast with vibrant accents. Dark mode optimized.',
        tokens: {
            backdropBlur: '0',
            cardShadow: 'lg',
            borderRadius: 'md',
            glowIntensity: '0.5',
            transitionDuration: '150ms',
            transitionEasing: 'ease-out',
            borderOpacity: '0.3',
            cardOpacity: '0.8',
        },
    },
    'material-motion': {
        id: 'material-motion',
        name: 'Material Motion',
        emoji: '🎯',
        description: 'Elevation-based shadows with expressive motion.',
        tokens: {
            backdropBlur: '4px',
            cardShadow: 'md',
            borderRadius: 'lg',
            glowIntensity: '0',
            transitionDuration: '300ms',
            transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            borderOpacity: '0.1',
            cardOpacity: '1',
        },
    },
} as const;

export type UiStyleKey = keyof typeof uiStylePresets;
export const uiStyleKeys = Object.keys(uiStylePresets);

export const defaultUiStyle: UiStyleKey = 'glass-neon';

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
    };
}
