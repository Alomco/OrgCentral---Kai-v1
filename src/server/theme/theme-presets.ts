/**
 * 🎨 Theme Presets - Futuristic color schemes for tenant customization
 * 
 * Each preset defines a complete HSL color palette that creates
 * a cohesive, vibrant futuristic UI experience.
 */

import type { HslValue, ThemeTokenMap } from './tokens';

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    emoji: string;
    tokens: Partial<ThemeTokenMap> & {
        primary: HslValue;
        accent: HslValue;
        ring: HslValue;
    };
}

const HSL_CHART_CYAN = '200 98% 39%' as HslValue;
const HSL_CHART_YELLOW = '48 96% 53%' as HslValue;
const HSL_CHART_ORANGE = '31 87% 51%' as HslValue;

const cyberpunkPrimary = '262 83% 58%' as HslValue;

// 🔮 Cyberpunk Purple - Default futuristic theme
const cyberpunkPurple: ThemePreset = {
    id: 'cyberpunk-purple',
    name: 'Cyberpunk Purple',
    description: 'Vibrant purple and pink with neon accents',
    emoji: '🔮',
    tokens: {
        'primary': cyberpunkPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '330 81% 60%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': cyberpunkPrimary,
        'chart-1': '330 81% 60%' as HslValue,
        'chart-2': cyberpunkPrimary,
        'chart-3': HSL_CHART_CYAN,
        'chart-4': HSL_CHART_YELLOW,
        'chart-5': HSL_CHART_ORANGE,
        'sidebar-primary': '262 83% 65%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '330 70% 55%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': cyberpunkPrimary,
    },
};

// 🌊 Ocean Depths - Cool blue/cyan theme
const oceanDepths: ThemePreset = {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Deep blues and cyan with aquatic vibes',
    emoji: '🌊',
    tokens: {
        'primary': HSL_CHART_CYAN,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '175 80% 40%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': HSL_CHART_CYAN,
        'chart-1': '175 80% 40%' as HslValue,
        'chart-2': HSL_CHART_CYAN,
        'chart-3': '220 90% 56%' as HslValue,
        'chart-4': HSL_CHART_YELLOW,
        'chart-5': HSL_CHART_ORANGE,
        'sidebar-primary': '175 80% 50%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '200 90% 45%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': HSL_CHART_CYAN,
    },
};

// 🌅 Sunset Blaze - Warm orange/red theme
const sunsetPrimary = '25 95% 53%' as HslValue;
const sunsetAccent = '350 80% 55%' as HslValue;
const sunsetBlaze: ThemePreset = {
    id: 'sunset-blaze',
    name: 'Sunset Blaze',
    description: 'Warm oranges and fiery reds',
    emoji: '🌅',
    tokens: {
        'primary': sunsetPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': sunsetAccent,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': sunsetPrimary,
        'chart-1': sunsetAccent,
        'chart-2': sunsetPrimary,
        'chart-3': '45 93% 47%' as HslValue,
        'chart-4': HSL_CHART_YELLOW,
        'chart-5': '0 72% 51%' as HslValue,
        'sidebar-primary': '25 95% 60%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '350 75% 60%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': sunsetPrimary,
    },
};

// 🌿 Forest Emerald - Rich green theme
const forestPrimary = '160 84% 39%' as HslValue;
const forestEmerald: ThemePreset = {
    id: 'forest-emerald',
    name: 'Forest Emerald',
    description: 'Rich greens with natural energy',
    emoji: '🌿',
    tokens: {
        'primary': forestPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '120 60% 45%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': forestPrimary,
        'chart-1': '120 60% 45%' as HslValue,
        'chart-2': forestPrimary,
        'chart-3': '180 70% 40%' as HslValue,
        'chart-4': HSL_CHART_YELLOW,
        'chart-5': '90 60% 40%' as HslValue,
        'sidebar-primary': '160 84% 45%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '120 55% 50%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': forestPrimary,
    },
};

// ⚡ Neon Electric - High-contrast neon theme
const neonForeground = '240 84% 5%' as HslValue;
const neonPrimary = '280 100% 60%' as HslValue;
const neonAccent = '180 100% 50%' as HslValue;
const neonElectric: ThemePreset = {
    id: 'neon-electric',
    name: 'Neon Electric',
    description: 'High-energy neon with electric vibes',
    emoji: '⚡',
    tokens: {
        'primary': neonPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': neonAccent,
        'accent-foreground': neonForeground,
        'ring': neonPrimary,
        'chart-1': neonAccent,
        'chart-2': neonPrimary,
        'chart-3': '60 100% 50%' as HslValue,
        'chart-4': '330 100% 60%' as HslValue,
        'chart-5': '120 100% 50%' as HslValue,
        'sidebar-primary': neonAccent,
        'sidebar-primary-foreground': neonForeground,
        'sidebar-accent': neonPrimary,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': neonAccent,
    },
};

// 🍇 Royal Velvet - Luxurious deep purple
const royalForeground = '270 84% 5%' as HslValue;
const royalPrimary = '270 70% 45%' as HslValue;
const royalAccent = '45 90% 50%' as HslValue;
const royalVelvet: ThemePreset = {
    id: 'royal-velvet',
    name: 'Royal Velvet',
    description: 'Luxurious deep purples with gold accents',
    emoji: '🍇',
    tokens: {
        'primary': royalPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': royalAccent,
        'accent-foreground': royalForeground,
        'ring': royalPrimary,
        'chart-1': royalAccent,
        'chart-2': royalPrimary,
        'chart-3': '300 60% 50%' as HslValue,
        'chart-4': HSL_CHART_YELLOW,
        'chart-5': '330 70% 50%' as HslValue,
        'sidebar-primary': '45 90% 55%' as HslValue,
        'sidebar-primary-foreground': royalForeground,
        'sidebar-accent': '270 60% 55%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': royalPrimary,
    },
};

// 🔥 Inferno Red - Bold red with hot accents
const infernoPrimary = '355 85% 55%' as HslValue;
const infernoRed: ThemePreset = {
    id: 'inferno-red',
    name: 'Inferno Red',
    description: 'Bold reds with fiery orange highlights',
    emoji: '🔥',
    tokens: {
        'primary': infernoPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '20 90% 55%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': infernoPrimary,
        'chart-1': infernoPrimary,
        'chart-2': '20 90% 55%' as HslValue,
        'chart-3': '35 85% 50%' as HslValue,
        'chart-4': '10 80% 50%' as HslValue,
        'chart-5': '45 75% 55%' as HslValue,
        'sidebar-primary': '355 85% 60%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '20 85% 60%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': infernoPrimary,
    },
};

// 🌸 Cherry Blossom - Soft pink with delicate accents
const cherryPrimary = '340 75% 60%' as HslValue;
const cherryBlossom: ThemePreset = {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft pinks with spring freshness',
    emoji: '🌸',
    tokens: {
        'primary': cherryPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '320 70% 58%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': cherryPrimary,
        'chart-1': cherryPrimary,
        'chart-2': '320 70% 58%' as HslValue,
        'chart-3': '350 65% 55%' as HslValue,
        'chart-4': '300 60% 50%' as HslValue,
        'chart-5': '330 68% 52%' as HslValue,
        'sidebar-primary': '340 75% 65%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '320 70% 63%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': cherryPrimary,
    },
};

// 🌌 Galaxy Indigo - Deep space with cosmic blues
const galaxyForeground = '230 84% 5%' as HslValue;
const galaxyPrimary = '230 80% 50%' as HslValue;
const galaxyIndigo: ThemePreset = {
    id: 'galaxy-indigo',
    name: 'Galaxy Indigo',
    description: 'Deep cosmic indigo with starlight highlights',
    emoji: '🌌',
    tokens: {
        'primary': galaxyPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '250 90% 65%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': galaxyPrimary,
        'chart-1': galaxyPrimary,
        'chart-2': '250 90% 65%' as HslValue,
        'chart-3': '210 85% 55%' as HslValue,
        'chart-4': '270 75% 60%' as HslValue,
        'chart-5': '200 80% 50%' as HslValue,
        'sidebar-primary': '230 80% 55%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '250 85% 70%' as HslValue,
        'sidebar-accent-foreground': galaxyForeground,
        'sidebar-ring': galaxyPrimary,
    },
};

// 🍊 Tangerine Dream - Vibrant orange with citrus energy
const tangerinePrimary = '35 95% 58%' as HslValue;
const tangerineDream: ThemePreset = {
    id: 'tangerine-dream',
    name: 'Tangerine Dream',
    description: 'Vibrant orange with fresh citrus energy',
    emoji: '🍊',
    tokens: {
        'primary': tangerinePrimary,
        'primary-foreground': '35 84% 5%' as HslValue,
        'accent': '25 92% 55%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': tangerinePrimary,
        'chart-1': tangerinePrimary,
        'chart-2': '25 92% 55%' as HslValue,
        'chart-3': '45 90% 50%' as HslValue,
        'chart-4': '15 88% 52%' as HslValue,
        'chart-5': '50 85% 55%' as HslValue,
        'sidebar-primary': '35 95% 63%' as HslValue,
        'sidebar-primary-foreground': '35 84% 5%' as HslValue,
        'sidebar-accent': '25 90% 60%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': tangerinePrimary,
    },
};

// 🎯 Ruby Matrix - Professional red with digital vibes
const rubyPrimary = '350 80% 50%' as HslValue;
const rubyMatrix: ThemePreset = {
    id: 'ruby-matrix',
    name: 'Ruby Matrix',
    description: 'Professional ruby red with digital energy',
    emoji: '🎯',
    tokens: {
        'primary': rubyPrimary,
        'primary-foreground': '0 0% 100%' as HslValue,
        'accent': '5 75% 52%' as HslValue,
        'accent-foreground': '0 0% 100%' as HslValue,
        'ring': rubyPrimary,
        'chart-1': rubyPrimary,
        'chart-2': '5 75% 52%' as HslValue,
        'chart-3': '340 75% 55%' as HslValue,
        'chart-4': '10 78% 50%' as HslValue,
        'chart-5': '330 72% 52%' as HslValue,
        'sidebar-primary': '350 80% 55%' as HslValue,
        'sidebar-primary-foreground': '0 0% 100%' as HslValue,
        'sidebar-accent': '5 75% 57%' as HslValue,
        'sidebar-accent-foreground': '0 0% 100%' as HslValue,
        'sidebar-ring': rubyPrimary,
    },
};

/** All available theme presets */
export const themePresets = {
    'cyberpunk-purple': cyberpunkPurple,
    'ocean-depths': oceanDepths,
    'sunset-blaze': sunsetBlaze,
    'forest-emerald': forestEmerald,
    'neon-electric': neonElectric,
    'royal-velvet': royalVelvet,
    'inferno-red': infernoRed,
    'cherry-blossom': cherryBlossom,
    'galaxy-indigo': galaxyIndigo,
    'tangerine-dream': tangerineDream,
    'ruby-matrix': rubyMatrix,
} as const satisfies Record<string, ThemePreset>;

export type ThemePresetId = keyof typeof themePresets;

/** Default theme preset ID */
export const defaultPresetId: ThemePresetId = 'cyberpunk-purple';

export function isThemePresetId(value: string): value is ThemePresetId {
    return Object.prototype.hasOwnProperty.call(themePresets, value);
}

/** Get preset by ID, falls back to default */
export function getThemePreset(presetId: string): ThemePreset {
    const resolvedId: ThemePresetId = isThemePresetId(presetId) ? presetId : defaultPresetId;
    return themePresets[resolvedId];
}

/** Get all preset options for UI selectors */
export interface ThemePresetOption { id: string; name: string; emoji: string; description: string }

export function getPresetOptions(): ThemePresetOption[] {
    return Object.values(themePresets).map(({ id, name, emoji, description }) => ({
        id,
        name,
        emoji,
        description,
    }));
}
