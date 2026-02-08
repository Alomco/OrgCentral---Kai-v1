import type { ColorTokenValue } from './tokens';
import { accents, makePreset, surface, WHITE } from './theme-presets.shared';

const horizonPrimaryLight: ColorTokenValue = '0.4800 0.1450 245.00';
const horizonPrimaryDark: ColorTokenValue = '0.5800 0.1700 245.00';
const horizonAccentGold: ColorTokenValue = '0.7500 0.1400 85.00';
const horizonAccentForeground: ColorTokenValue = '0.2200 0.0300 250.00';
const horizonSignalBlue: ColorTokenValue = '0.5600 0.1500 245.00';
const horizonSignalTeal: ColorTokenValue = '0.7200 0.1200 195.00';
const horizonSignalGreen: ColorTokenValue = '0.6800 0.1600 150.00';
const horizonSignalViolet: ColorTokenValue = '0.5800 0.1600 290.00';
const horizonForegroundLight: ColorTokenValue = '0.2200 0.0120 250.00';
const horizonForegroundDark: ColorTokenValue = '0.9200 0.0060 245.00';
const horizonSidebarAccentLight: ColorTokenValue = '0.9500 0.0120 245.00';
const horizonSidebarAccentDark: ColorTokenValue = '0.2600 0.0150 245.00';
const horizonSurfaceDark: ColorTokenValue = '0.2000 0.0120 245.00';

export const horizonBluePreset = makePreset({
    id: 'horizon-blue',
    name: 'Horizon Blue',
    description: 'Clean cerulean blue with gold signals',
    emoji: 'HB',
    accents: accents(
        horizonPrimaryLight,
        WHITE,
        horizonAccentGold,
        horizonAccentForeground,
        horizonSignalBlue,
        horizonSignalBlue,
        horizonSignalTeal,
        horizonSignalGreen,
        horizonAccentGold,
        horizonSignalViolet,
        horizonPrimaryLight,
        WHITE,
        horizonSidebarAccentLight,
        horizonForegroundLight,
        horizonSignalBlue,
    ),
    darkAccents: accents(
        horizonPrimaryDark,
        WHITE,
        horizonAccentGold,
        horizonAccentForeground,
        horizonPrimaryDark,
        horizonSignalBlue,
        horizonSignalTeal,
        horizonSignalGreen,
        horizonAccentGold,
        horizonSignalViolet,
        horizonPrimaryDark,
        WHITE,
        horizonSidebarAccentDark,
        horizonForegroundDark,
        horizonPrimaryDark,
    ),
    light: surface(
        '0.9850 0.0020 245.00',
        horizonForegroundLight,
        '0.9940 0.0010 245.00',
        '0.9650 0.0050 245.00',
        '0.5000 0.0180 250.00',
        '0.9100 0.0080 245.00',
        '0.9650 0.0050 245.00',
        horizonForegroundLight,
    ),
    dark: surface(
        '0.1600 0.0100 245.00',
        horizonForegroundDark,
        horizonSurfaceDark,
        horizonSidebarAccentDark,
        '0.6800 0.0180 245.00',
        '0.3500 0.0150 245.00',
        horizonSurfaceDark,
        horizonForegroundDark,
    ),
});
