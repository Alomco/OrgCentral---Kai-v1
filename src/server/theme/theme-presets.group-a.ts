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

/* ── Cyberpunk Purple: toned down from garish neon to refined electric ── */
const cyberpunkPrimary: ColorTokenValue = '0.5200 0.1900 290.00';
const cyberpunkAccent: ColorTokenValue = '0.7000 0.1100 190.00';
const cyberpunkChartBlue: ColorTokenValue = '0.5800 0.1300 240.00';
const cyberpunkSidebarAccent: ColorTokenValue = '0.9200 0.0200 285.00';
const cyberpunkSidebarAccentForeground: ColorTokenValue = '0.2400 0.0250 280.00';
const cyberpunkDarkAccent: ColorTokenValue = '0.7200 0.1000 195.00';
const cyberpunkDarkAccentForeground: ColorTokenValue = '0.1500 0.0150 250.00';
const cyberpunkDarkRing: ColorTokenValue = '0.5800 0.1500 270.00';

/* ── Sunset Blaze: warm orange primary with cool teal accent for contrast ── */
const sunsetPrimary: ColorTokenValue = '0.6800 0.1600 50.00';
const sunsetAccent: ColorTokenValue = '0.6200 0.1200 195.00';
const oceanPrimary: ColorTokenValue = '0.5400 0.1200 230.00';

/* ── Forest Emerald: rich green primary with warm coral accent ── */
const forestPrimary: ColorTokenValue = '0.6200 0.1300 160.00';

/* ── Neon Electric: chroma reduced ~30% for less eye fatigue ── */
const neonPrimary: ColorTokenValue = '0.5800 0.1900 310.00';
const neonAccent: ColorTokenValue = '0.8000 0.1100 190.00';

/* ── Royal Velvet: lower chroma for sophistication ── */
const royalPrimary: ColorTokenValue = '0.4500 0.1600 300.00';
const royalAccent: ColorTokenValue = '0.7800 0.1300 85.00';

export const themePresetsGroupA = {
    'cyberpunk-purple': makePreset({
        id: 'cyberpunk-purple',
        name: 'Cyberpunk Purple',
        description: 'Electric purple with cyan neon accents',
        emoji: '🔮',
        accents: accents(
            cyberpunkPrimary,
            WHITE,
            cyberpunkAccent,
            INK,
            cyberpunkPrimary,
            cyberpunkChartBlue,
            cyberpunkPrimary,
            HSL_CHART_CYAN,
            HSL_CHART_YELLOW,
            HSL_CHART_ORANGE,
            '0.5800 0.1700 292.00',
            WHITE,
            cyberpunkSidebarAccent,
            cyberpunkSidebarAccentForeground,
            cyberpunkPrimary,
        ),
        darkAccents: accents(
            cyberpunkPrimary,
            WHITE,
            cyberpunkDarkAccent,
            cyberpunkDarkAccentForeground,
            cyberpunkDarkRing,
            cyberpunkChartBlue,
            cyberpunkPrimary,
            HSL_CHART_CYAN,
            HSL_CHART_YELLOW,
            HSL_CHART_ORANGE,
            '0.5800 0.1700 292.00',
            WHITE,
            '0.2800 0.0350 295.00',
            '0.9400 0.0050 290.00',
            cyberpunkDarkRing,
        ),
        light: surface('0.9800 0.0060 295.00', '0.2000 0.0500 290.00', '0.9920 0.0025 295.00', '0.9500 0.0100 295.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9720 0.0060 295.00', '0.2800 0.0500 290.00'),
        dark: surface('0.1500 0.0250 292.00', '0.9400 0.0050 290.00', '0.2100 0.0350 292.00', '0.2800 0.0350 292.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1400 0.0300 292.00', '0.9300 0.0080 290.00'),
    }),
    'ocean-depths': makePreset({
        id: 'ocean-depths',
        name: 'Ocean Depths',
        description: 'Deep blues and cyan with aquatic vibes',
        emoji: '🌊',
        accents: accents(
            oceanPrimary,
            INK,
            '0.6800 0.1000 185.00',
            INK,
            oceanPrimary,
            '0.6800 0.1000 185.00',
            oceanPrimary,
            '0.5500 0.1600 255.00',
            HSL_CHART_YELLOW,
            HSL_CHART_ORANGE,
            '0.7200 0.1100 190.00',
            WHITE,
            '0.5800 0.1100 235.00',
            WHITE,
            oceanPrimary,
        ),
        light: surface('0.9860 0.0040 225.00', '0.2200 0.0200 240.00', '0.9930 0.0015 225.00', '0.9500 0.0080 225.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9780 0.0040 225.00', '0.2800 0.0250 240.00'),
        dark: surface('0.1600 0.0150 235.00', '0.9300 0.0050 230.00', '0.2100 0.0200 235.00', '0.2700 0.0200 235.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1800 0.0180 235.00', '0.9200 0.0060 230.00'),
    }),
    'sunset-blaze': makePreset({
        id: 'sunset-blaze',
        name: 'Sunset Blaze',
        description: 'Warm oranges with cool teal contrast',
        emoji: '🌅',
        accents: accents(
            sunsetPrimary,
            INK,
            sunsetAccent,
            INK,
            '0.6000 0.1400 40.00',
            sunsetPrimary,
            sunsetAccent,
            '0.7500 0.1300 85.00',
            HSL_CHART_YELLOW,
            '0.5800 0.1600 30.00',
            '0.7200 0.1400 55.00',
            WHITE,
            '0.6000 0.1200 200.00',
            WHITE,
            sunsetPrimary,
        ),
        light: surface('0.9800 0.0080 55.00', '0.2200 0.0250 40.00', '0.9930 0.0025 55.00', '0.9450 0.0150 55.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9720 0.0090 55.00', '0.3000 0.0300 40.00'),
        dark: surface('0.1700 0.0180 45.00', '0.9300 0.0070 55.00', '0.2200 0.0200 48.00', '0.2800 0.0220 50.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1900 0.0200 48.00', '0.9200 0.0080 55.00'),
    }),
    'forest-emerald': makePreset({
        id: 'forest-emerald',
        name: 'Forest Emerald',
        description: 'Rich greens with warm coral accent',
        emoji: '🌿',
        accents: accents(
            forestPrimary,
            INK,
            '0.6800 0.1300 30.00',
            INK,
            '0.5600 0.1200 155.00',
            forestPrimary,
            '0.6800 0.1300 30.00',
            '0.6500 0.1000 195.00',
            HSL_CHART_YELLOW,
            '0.6200 0.1400 130.00',
            '0.7000 0.1300 158.00',
            WHITE,
            '0.6800 0.1600 145.00',
            WHITE,
            forestPrimary,
        ),
        light: surface('0.9830 0.0080 160.00', '0.2400 0.0200 165.00', '0.9940 0.0025 160.00', '0.9500 0.0120 160.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9750 0.0080 160.00', '0.3200 0.0280 165.00'),
        dark: surface('0.1700 0.0180 165.00', '0.9300 0.0070 160.00', '0.2200 0.0220 165.00', '0.2800 0.0250 165.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.2000 0.0200 165.00', '0.9200 0.0090 160.00'),
    }),
    'neon-electric': makePreset({
        id: 'neon-electric',
        name: 'Neon Electric',
        description: 'High-energy neon with controlled vibrancy',
        emoji: '⚡',
        accents: accents(
            neonPrimary,
            INK,
            neonAccent,
            INK,
            neonPrimary,
            neonAccent,
            neonPrimary,
            '0.8500 0.1500 105.00',
            '0.6500 0.1700 355.00',
            '0.7800 0.1800 140.00',
            neonAccent,
            NEON_FOREGROUND,
            neonPrimary,
            WHITE,
            neonAccent,
        ),
        light: surface('0.9720 0.0120 315.00', '0.2200 0.0350 310.00', '0.9900 0.0035 315.00', '0.9350 0.0160 315.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9650 0.0100 315.00', '0.2800 0.0400 312.00'),
        dark: surface('0.1600 0.0280 310.00', '0.9400 0.0070 315.00', '0.2100 0.0350 310.00', '0.2600 0.0380 310.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1800 0.0320 310.00', '0.9200 0.0120 315.00'),
    }),
    'royal-velvet': makePreset({
        id: 'royal-velvet',
        name: 'Royal Velvet',
        description: 'Refined deep purples with gold accents',
        emoji: '🍇',
        accents: accents(
            royalPrimary,
            WHITE,
            royalAccent,
            ROYAL_FOREGROUND,
            '0.5200 0.1400 280.00',
            royalAccent,
            royalPrimary,
            '0.5800 0.1800 325.00',
            HSL_CHART_YELLOW,
            '0.5600 0.1600 355.00',
            '0.7800 0.1200 88.00',
            ROYAL_FOREGROUND,
            '0.5200 0.1500 305.00',
            WHITE,
            royalPrimary,
        ),
        light: surface('0.9720 0.0080 305.00', '0.2100 0.0350 300.00', '0.9900 0.0025 305.00', '0.9300 0.0130 305.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9640 0.0080 305.00', '0.2800 0.0400 302.00'),
        dark: surface('0.1600 0.0250 302.00', '0.9400 0.0060 305.00', '0.2100 0.0300 302.00', '0.2600 0.0350 302.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1800 0.0300 302.00', '0.9200 0.0100 305.00'),
    }),
} as const satisfies Record<string, ThemePreset>;
