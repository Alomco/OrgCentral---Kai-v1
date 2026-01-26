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
import type { ThemePreset } from './theme-presets.shared';

const infernoPrimary: ColorTokenValue = '355 85% 55%';
const cherryPrimary: ColorTokenValue = '340 75% 60%';
const galaxyPrimary: ColorTokenValue = '230 80% 50%';
const tangerinePrimary: ColorTokenValue = '35 95% 58%';
const tangerineAccent: ColorTokenValue = '25 92% 55%';
const rubyPrimary: ColorTokenValue = '350 80% 50%';
const corporatePrimary: ColorTokenValue = '220 80% 45%';
const corporateAccent: ColorTokenValue = '200 75% 40%';

export const themePresetsGroupB = {
    'inferno-red': makePreset({
        id: 'inferno-red',
        name: 'Inferno Red',
        description: 'Bold reds with fiery orange highlights',
        emoji: '??',
        accents: accents(infernoPrimary, INK, '20 90% 55%', INK, infernoPrimary, infernoPrimary, '20 90% 55%', '35 85% 50%', '10 80% 50%', '45 75% 55%', '355 85% 60%', WHITE, '20 85% 60%', WHITE, infernoPrimary),
        light: surface('350 80% 97%', '350 40% 12%', '350 70% 99%', '350 35% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '350 45% 96%', '350 30% 20%'),
        dark: surface('350 40% 8%', '350 20% 94%', '350 35% 12%', '350 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '350 40% 10%', '350 20% 90%'),
    }),
    'cherry-blossom': makePreset({
        id: 'cherry-blossom',
        name: 'Cherry Blossom',
        description: 'Soft pinks with spring freshness',
        emoji: '??',
        accents: accents(cherryPrimary, INK, '320 70% 58%', INK, cherryPrimary, cherryPrimary, '320 70% 58%', '350 65% 55%', '300 60% 50%', '330 68% 52%', '340 75% 65%', WHITE, '320 70% 63%', WHITE, cherryPrimary),
        light: surface('340 80% 97%', '340 40% 12%', '340 70% 99%', '340 35% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '340 45% 96%', '340 30% 20%'),
        dark: surface('340 40% 8%', '340 20% 94%', '340 35% 12%', '340 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '340 40% 10%', '340 20% 90%'),
    }),
    'galaxy-indigo': makePreset({
        id: 'galaxy-indigo',
        name: 'Galaxy Indigo',
        description: 'Deep cosmic indigo with starlight highlights',
        emoji: '??',
        accents: accents(galaxyPrimary, WHITE, '250 90% 65%', '0.98 0 0', '0.6 0.16 230', galaxyPrimary, '250 90% 65%', '210 85% 55%', '270 75% 60%', '200 80% 50%', '230 80% 55%', WHITE, '250 85% 70%', GALAXY_FOREGROUND, galaxyPrimary),
        light: surface('230 60% 97%', '230 45% 12%', '230 50% 99%', '230 35% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '230 40% 96%', '230 30% 20%'),
        dark: surface('230 40% 8%', '230 20% 94%', '230 35% 12%', '230 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '230 40% 10%', '230 20% 90%'),
    }),
    'tangerine-dream': makePreset({
        id: 'tangerine-dream',
        name: 'Tangerine Dream',
        description: 'Vibrant orange with fresh citrus energy',
        emoji: '??',
        accents: accents(tangerinePrimary, TANGERINE_FOREGROUND, tangerineAccent, INK, '0.6 0.16 35', tangerinePrimary, tangerineAccent, '45 90% 50%', '15 88% 52%', '50 85% 55%', '35 95% 63%', TANGERINE_FOREGROUND, '25 90% 60%', WHITE, tangerinePrimary),
        light: surface('35 85% 97%', '20 50% 12%', '35 80% 99%', '35 40% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '35 60% 96%', '30 35% 20%'),
        dark: surface('30 40% 8%', '35 20% 94%', '30 35% 12%', '30 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '30 40% 10%', '35 20% 90%'),
    }),
    'ruby-matrix': makePreset({
        id: 'ruby-matrix',
        name: 'Ruby Matrix',
        description: 'Professional ruby red with digital energy',
        emoji: '??',
        accents: accents(rubyPrimary, WHITE, '5 75% 52%', INK, rubyPrimary, rubyPrimary, '5 75% 52%', '340 75% 55%', '10 78% 50%', '330 72% 52%', '350 80% 55%', WHITE, '5 75% 57%', WHITE, rubyPrimary),
        light: surface('350 70% 97%', '350 40% 12%', '350 60% 99%', '350 35% 92%', LIGHT_MUTED_FOREGROUND, LIGHT_BORDER, '350 40% 96%', '350 30% 20%'),
        dark: surface('350 40% 8%', '350 20% 94%', '350 35% 12%', '350 30% 16%', DARK_MUTED_FOREGROUND, DARK_BORDER, '350 40% 10%', '350 20% 90%'),
    }),
    'corporate-slate': makePreset({
        id: 'corporate-slate',
        name: 'Corporate Slate',
        description: 'Crisp neutrals with a confident blue accent',
        emoji: '??',
        accents: accents(
            corporatePrimary,
            WHITE,
            corporateAccent,
            INK,
            '0.6 0.16 220',
            '205 78% 45%',
            '160 60% 38%',
            '35 85% 50%',
            '280 60% 55%',
            '10 75% 50%',
            corporatePrimary,
            WHITE,
            '210 35% 94%',
            '215 25% 16%',
            corporatePrimary,
        ),
        light: surface(
            '210 40% 98%',
            '215 25% 12%',
            '210 40% 99%',
            '210 25% 94%',
            LIGHT_MUTED_FOREGROUND,
            LIGHT_BORDER,
            '210 35% 97%',
            '215 25% 16%',
        ),
        dark: surface(
            '215 30% 8%',
            '210 20% 96%',
            '215 26% 12%',
            '215 20% 16%',
            DARK_MUTED_FOREGROUND,
            DARK_BORDER,
            '215 26% 10%',
            '210 20% 90%',
        ),
    }),
} as const satisfies Record<string, ThemePreset>;
