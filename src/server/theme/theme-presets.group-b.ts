import type { ColorTokenValue } from './tokens';
import {
    accents,
    DARK_BORDER,
    DARK_MUTED_FOREGROUND,
    GALAXY_FOREGROUND,
    INK,
    LIGHT_BORDER,
    LIGHT_MUTED_FOREGROUND,
    makePreset,
    surface,
    TANGERINE_FOREGROUND,
    WHITE,
} from './theme-presets.shared';
import { horizonBluePreset } from './theme-presets.group-b.horizon';
import type { ThemePreset } from './theme-presets.shared';

/* ── Inferno: warm red-orange (H≈35) distinct from Ruby ── */
const infernoPrimary: ColorTokenValue = '0.6000 0.1800 35.00';

/* ── Cherry Blossom: pink primary with spring green accent ── */
const cherryPrimary: ColorTokenValue = '0.6200 0.1600 5.00';

/* ── Galaxy Indigo: reduced chroma for cosmic depth ── */
const galaxyPrimary: ColorTokenValue = '0.4500 0.1800 268.00';

/* ── Tangerine Dream: vibrant but controlled orange ── */
const tangerinePrimary: ColorTokenValue = '0.7500 0.1400 68.00';
const tangerineAccent: ColorTokenValue = '0.6800 0.1500 48.00';

/* ── Ruby Matrix: cool crimson (H≈355) separated from Inferno ── */
const rubyPrimary: ColorTokenValue = '0.5600 0.1900 355.00';

/* ── Corporate Slate: ultra-neutral with confident blue ── */
const corporatePrimary: ColorTokenValue = '0.4800 0.1500 245.00';
const corporateAccent: ColorTokenValue = '0.5600 0.1000 235.00';

/* ── Horizon Blue: refined cerulean + gold (default preset) ── */
export const themePresetsGroupB = {
    'inferno-red': makePreset({
        id: 'inferno-red',
        name: 'Inferno Red',
        description: 'Bold warm reds with fiery orange highlights',
        emoji: '🔥',
        accents: accents(
            infernoPrimary,
            INK,
            '0.7000 0.1500 55.00',
            INK,
            infernoPrimary,
            infernoPrimary,
            '0.7000 0.1500 55.00',
            '0.7200 0.1300 65.00',
            '0.5800 0.1700 25.00',
            '0.7800 0.1300 88.00',
            '0.6200 0.1600 30.00',
            WHITE,
            '0.6800 0.1300 48.00',
            WHITE,
            infernoPrimary,
        ),
        light: surface('0.9750 0.0100 20.00', '0.2200 0.0280 15.00', '0.9920 0.0030 20.00', '0.9350 0.0120 20.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9650 0.0080 18.00', '0.2800 0.0320 15.00'),
        dark: surface('0.1600 0.0200 18.00', '0.9400 0.0050 20.00', '0.2100 0.0250 18.00', '0.2600 0.0280 17.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1800 0.0230 18.00', '0.9200 0.0080 20.00'),
    }),
    'cherry-blossom': makePreset({
        id: 'cherry-blossom',
        name: 'Cherry Blossom',
        description: 'Soft pinks with spring green accent',
        emoji: '🌸',
        accents: accents(
            cherryPrimary,
            INK,
            '0.6800 0.1400 130.00',
            INK,
            cherryPrimary,
            cherryPrimary,
            '0.6800 0.1400 130.00',
            '0.5800 0.1400 15.00',
            '0.6000 0.1800 330.00',
            '0.5800 0.1600 355.00',
            '0.6500 0.1400 2.00',
            WHITE,
            '0.6500 0.1500 340.00',
            WHITE,
            cherryPrimary,
        ),
        light: surface('0.9750 0.0100 355.00', '0.2200 0.0280 0.00', '0.9920 0.0030 355.00', '0.9350 0.0120 355.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9650 0.0080 355.00', '0.2800 0.0320 0.00'),
        dark: surface('0.1600 0.0200 0.00', '0.9400 0.0050 355.00', '0.2100 0.0260 0.00', '0.2600 0.0280 0.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1800 0.0240 0.00', '0.9200 0.0080 355.00'),
    }),
    'galaxy-indigo': makePreset({
        id: 'galaxy-indigo',
        name: 'Galaxy Indigo',
        description: 'Deep cosmic indigo with starlight highlights',
        emoji: '🌌',
        accents: accents(
            galaxyPrimary,
            WHITE,
            '0.5500 0.1700 285.00',
            '0.9500 0.0000 0.00',
            '0.5200 0.1300 235.00',
            galaxyPrimary,
            '0.5500 0.1700 285.00',
            '0.6000 0.1400 250.00',
            '0.5600 0.1600 305.00',
            '0.6500 0.1200 235.00',
            '0.4800 0.1600 270.00',
            WHITE,
            '0.6000 0.1400 288.00',
            GALAXY_FOREGROUND,
            galaxyPrimary,
        ),
        light: surface('0.9720 0.0070 275.00', '0.2100 0.0300 270.00', '0.9900 0.0020 275.00', '0.9300 0.0120 275.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9640 0.0060 275.00', '0.2700 0.0350 272.00'),
        dark: surface('0.1500 0.0200 272.00', '0.9400 0.0050 275.00', '0.2000 0.0250 272.00', '0.2500 0.0280 272.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1700 0.0240 272.00', '0.9200 0.0080 275.00'),
    }),
    'tangerine-dream': makePreset({
        id: 'tangerine-dream',
        name: 'Tangerine Dream',
        description: 'Vibrant orange with fresh citrus energy',
        emoji: '🍊',
        accents: accents(
            tangerinePrimary,
            TANGERINE_FOREGROUND,
            tangerineAccent,
            INK,
            '0.6000 0.1200 40.00',
            tangerinePrimary,
            tangerineAccent,
            '0.7800 0.1300 85.00',
            '0.6200 0.1500 38.00',
            '0.8200 0.1400 95.00',
            '0.7800 0.1200 70.00',
            TANGERINE_FOREGROUND,
            '0.7200 0.1300 55.00',
            WHITE,
            tangerinePrimary,
        ),
        light: surface('0.9830 0.0080 75.00', '0.2200 0.0250 50.00', '0.9940 0.0025 75.00', '0.9500 0.0110 75.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9750 0.0080 75.00', '0.3100 0.0280 60.00'),
        dark: surface('0.1700 0.0150 65.00', '0.9400 0.0040 75.00', '0.2200 0.0180 65.00', '0.2700 0.0200 65.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1900 0.0170 65.00', '0.9200 0.0060 75.00'),
    }),
    'ruby-matrix': makePreset({
        id: 'ruby-matrix',
        name: 'Ruby Matrix',
        description: 'Cool crimson with digital precision',
        emoji: '🎯',
        accents: accents(
            rubyPrimary,
            WHITE,
            '0.5800 0.1600 30.00',
            INK,
            rubyPrimary,
            rubyPrimary,
            '0.5800 0.1600 30.00',
            '0.5800 0.1600 8.00',
            '0.5800 0.1500 340.00',
            '0.5600 0.1600 355.00',
            '0.5800 0.1700 350.00',
            WHITE,
            '0.5800 0.1500 0.00',
            WHITE,
            rubyPrimary,
        ),
        light: surface('0.9750 0.0080 355.00', '0.2200 0.0280 0.00', '0.9920 0.0025 355.00', '0.9350 0.0120 355.00', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '0.9650 0.0060 355.00', '0.2800 0.0320 0.00'),
        dark: surface('0.1600 0.0200 358.00', '0.9400 0.0050 355.00', '0.2100 0.0250 358.00', '0.2600 0.0280 358.00', DARK_MUTED_FOREGROUND, DARK_BORDER, '0.1800 0.0230 358.00', '0.9200 0.0080 355.00'),
    }),
    'corporate-slate': makePreset({
        id: 'corporate-slate',
        name: 'Corporate Slate',
        description: 'Crisp neutrals with a confident blue accent',
        emoji: '🏢',
        accents: accents(
            corporatePrimary,
            WHITE,
            corporateAccent,
            INK,
            '0.5200 0.1200 240.00',
            '0.5400 0.1200 245.00',
            '0.6000 0.1000 165.00',
            '0.7200 0.1300 65.00',
            '0.5600 0.1600 310.00',
            '0.5800 0.1500 35.00',
            corporatePrimary,
            WHITE,
            '0.9500 0.0060 245.00',
            '0.2500 0.0150 250.00',
            corporatePrimary,
        ),
        light: surface(
            '0.9850 0.0020 245.00',
            '0.2200 0.0120 250.00',
            '0.9940 0.0010 245.00',
            '0.9550 0.0040 245.00',
            LIGHT_MUTED_FOREGROUND,
            LIGHT_BORDER,
            '0.9760 0.0030 245.00',
            '0.2500 0.0150 250.00',
        ),
        dark: surface(
            '0.1500 0.0080 250.00',
            '0.9400 0.0020 245.00',
            '0.2000 0.0100 250.00',
            '0.2500 0.0100 250.00',
            DARK_MUTED_FOREGROUND,
            DARK_BORDER,
            '0.1800 0.0090 250.00',
            '0.9200 0.0050 245.00',
        ),
    }),
    'horizon-blue': horizonBluePreset,
} as const satisfies Record<string, ThemePreset>;
