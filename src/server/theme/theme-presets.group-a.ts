import type { ColorTokenValue } from './tokens';
import {
    accents,
    DARK_BORDER,
    DARK_MUTED_FOREGROUND,
    HSL_CHART_CYAN,
    HSL_CHART_ORANGE,
    HSL_CHART_YELLOW,
    INK,
    LIGHT_BORDER,
    LIGHT_MUTED_FOREGROUND,
    makePreset,
    NEON_FOREGROUND,
    ROYAL_FOREGROUND,
    surface,
    WHITE,
} from './theme-presets.shared';
import type { ThemePreset } from './theme-presets.shared';

const cyberpunkPrimary: ColorTokenValue = '262 83% 58%';
const sunsetPrimary: ColorTokenValue = '25 95% 53%';
const sunsetAccent: ColorTokenValue = '350 80% 55%';
const forestPrimary: ColorTokenValue = '160 84% 39%';
const neonPrimary: ColorTokenValue = '280 100% 60%';
const neonAccent: ColorTokenValue = '180 100% 50%';
const royalPrimary: ColorTokenValue = '270 70% 45%';
const royalAccent: ColorTokenValue = '45 90% 50%';

export const themePresetsGroupA = {
    'cyberpunk-purple': makePreset({
        id: 'cyberpunk-purple',
        name: 'Cyberpunk Purple',
        description: 'Vibrant purple and pink with neon accents',
        emoji: '??',
        accents: accents(cyberpunkPrimary, WHITE, '330 81% 60%', INK, cyberpunkPrimary, '330 81% 60%', cyberpunkPrimary, HSL_CHART_CYAN, HSL_CHART_YELLOW, HSL_CHART_ORANGE, '262 83% 65%', WHITE, '330 70% 55%', WHITE, cyberpunkPrimary),
        light: surface('262 60% 98%', '262 60% 12%', '262 50% 99%', '262 30% 94%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '262 35% 97%', '262 35% 22%'),
        dark: surface('262 45% 8%', '262 20% 96%', '262 40% 12%', '262 35% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '262 45% 10%', '262 20% 90%'),
    }),
    'ocean-depths': makePreset({
        id: 'ocean-depths',
        name: 'Ocean Depths',
        description: 'Deep blues and cyan with aquatic vibes',
        emoji: '??',
        accents: accents(HSL_CHART_CYAN, INK, '175 80% 40%', INK, HSL_CHART_CYAN, '175 80% 40%', HSL_CHART_CYAN, '220 90% 56%', HSL_CHART_YELLOW, HSL_CHART_ORANGE, '175 80% 50%', WHITE, '200 90% 45%', WHITE, HSL_CHART_CYAN),
        light: surface('200 60% 98%', '210 45% 12%', '200 50% 99%', '200 35% 93%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '200 40% 97%', '210 35% 20%'),
        dark: surface('205 50% 8%', '200 20% 92%', '205 45% 12%', '205 35% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '205 45% 10%', '200 20% 90%'),
    }),
    'sunset-blaze': makePreset({
        id: 'sunset-blaze',
        name: 'Sunset Blaze',
        description: 'Warm oranges and fiery reds',
        emoji: '??',
        accents: accents(sunsetPrimary, INK, sunsetAccent, INK, '0.6 0.18 25', sunsetAccent, sunsetPrimary, '45 93% 47%', HSL_CHART_YELLOW, '0 72% 51%', '25 95% 60%', WHITE, '350 75% 60%', WHITE, sunsetPrimary),
        light: surface('25 85% 97%', '20 55% 12%', '25 80% 99%', '25 60% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '25 70% 96%', '20 40% 20%'),
        dark: surface('20 45% 9%', '25 30% 92%', '22 40% 12%', '24 35% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '22 45% 10%', '24 25% 90%'),
    }),
    'forest-emerald': makePreset({
        id: 'forest-emerald',
        name: 'Forest Emerald',
        description: 'Rich greens with natural energy',
        emoji: '??',
        accents: accents(forestPrimary, INK, '120 60% 45%', INK, '0.58 0.16 160', '120 60% 45%', forestPrimary, '180 70% 40%', HSL_CHART_YELLOW, '90 60% 40%', '160 84% 45%', WHITE, '120 55% 50%', WHITE, forestPrimary),
        light: surface('150 60% 97%', '160 40% 12%', '150 50% 99%', '150 30% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '150 40% 96%', '160 30% 20%'),
        dark: surface('160 40% 8%', '150 20% 92%', '160 35% 12%', '160 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '160 40% 10%', '150 20% 90%'),
    }),
    'neon-electric': makePreset({
        id: 'neon-electric',
        name: 'Neon Electric',
        description: 'High-energy neon with electric vibes',
        emoji: '?',
        accents: accents(neonPrimary, INK, neonAccent, INK, neonPrimary, neonAccent, neonPrimary, '60 100% 50%', '330 100% 60%', '120 100% 50%', neonAccent, NEON_FOREGROUND, neonPrimary, WHITE, neonAccent),
        light: surface('285 70% 97%', '280 40% 12%', '285 60% 99%', '285 35% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '285 45% 96%', '280 30% 20%'),
        dark: surface('280 45% 8%', '285 20% 94%', '280 40% 12%', '280 35% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '280 45% 10%', '285 20% 90%'),
    }),
    'royal-velvet': makePreset({
        id: 'royal-velvet',
        name: 'Royal Velvet',
        description: 'Luxurious deep purples with gold accents',
        emoji: '??',
        accents: accents(royalPrimary, WHITE, royalAccent, ROYAL_FOREGROUND, '0.6 0.16 270', royalAccent, royalPrimary, '300 60% 50%', HSL_CHART_YELLOW, '330 70% 50%', '45 90% 55%', ROYAL_FOREGROUND, '270 60% 55%', WHITE, royalPrimary),
        light: surface('270 55% 97%', '270 40% 12%', '270 50% 99%', '270 30% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '270 40% 96%', '270 30% 20%'),
        dark: surface('270 40% 8%', '270 20% 94%', '270 35% 12%', '270 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '270 40% 10%', '270 20% 90%'),
    }),
} as const satisfies Record<string, ThemePreset>;
