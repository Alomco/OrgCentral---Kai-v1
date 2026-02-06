export const themeTokenKeys = [
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'destructive-foreground',
    'border',
    'input',
    'ring',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
    'sidebar',
    'sidebar-background',
    'sidebar-foreground',
    'sidebar-primary',
    'sidebar-primary-foreground',
    'sidebar-accent',
    'sidebar-accent-foreground',
    'sidebar-border',
    'sidebar-ring',
] as const;

export type ThemeTokenKey = typeof themeTokenKeys[number];

export type OklchValue = `${number} ${number} ${number}`;
export type ColorTokenValue = OklchValue;

export type ThemeTokenMap = Record<ThemeTokenKey, ColorTokenValue>;

import type { UiStyleKey } from './ui-style-presets';

export interface TenantTheme {
    orgId: string;
    presetId?: string;
    tokens: ThemeTokenMap;
    darkTokens: ThemeTokenMap;
    uiStyleId?: UiStyleKey;
    updatedAt: Date;
}

const PURE_WHITE: OklchValue = '1.0000 0.0000 0.00';
const HORIZON_FOREGROUND: OklchValue = '0.3791 0.1378 265.52';
const HORIZON_BORDER: OklchValue = '0.9288 0.0126 255.51';
const HORIZON_PRIMARY_BRIGHT: OklchValue = '0.6231 0.1880 259.81';
const HORIZON_ACCENT: OklchValue = '0.7686 0.1647 70.08';
const HORIZON_ACCENT_FOREGROUND: OklchValue = '0.2077 0.0398 265.75';

const palette = {
    white: PURE_WHITE,
    background: '0.9842 0.0034 247.86',
    foreground: HORIZON_FOREGROUND,
    surface: '0.9965 0.0017 247.84',
    muted: '0.9683 0.0069 247.90',
    mutedForeground: '0.4455 0.0374 257.28',
    border: HORIZON_BORDER,
    primary: '0.4244 0.1809 265.64',
    primaryBright: HORIZON_PRIMARY_BRIGHT,
    accent: HORIZON_ACCENT,
    accentForeground: HORIZON_ACCENT_FOREGROUND,
    destructive: '0.6368 0.2078 25.33',
    chartBlue: HORIZON_PRIMARY_BRIGHT,
    chartTeal: '0.7971 0.1339 211.53',
    chartGreen: '0.7227 0.1920 149.58',
    chartAmber: HORIZON_ACCENT,
    chartViolet: '0.6056 0.2189 292.72',
    sidebarBackground: '0.9683 0.0069 247.90',
    sidebarForeground: HORIZON_FOREGROUND,
    sidebarPrimary: '0.4244 0.1809 265.64',
    sidebarPrimaryForeground: PURE_WHITE,
    sidebarAccent: '0.9619 0.0179 272.31',
    sidebarAccentForeground: HORIZON_FOREGROUND,
    sidebarBorder: HORIZON_BORDER,
    sidebarRing: HORIZON_PRIMARY_BRIGHT,
} as const satisfies Record<string, ColorTokenValue>;

export const defaultThemeTokens = {
    background: palette.background,
    foreground: palette.foreground,
    card: palette.surface,
    'card-foreground': palette.foreground,
    popover: palette.surface,
    'popover-foreground': palette.foreground,
    primary: palette.primary,
    'primary-foreground': palette.white,
    secondary: palette.muted,
    'secondary-foreground': palette.foreground,
    muted: palette.muted,
    'muted-foreground': palette.mutedForeground,
    accent: palette.accent,
    'accent-foreground': palette.accentForeground,
    destructive: palette.destructive,
    'destructive-foreground': palette.white,
    border: palette.border,
    input: palette.border,
    ring: palette.primaryBright,
    'chart-1': palette.chartBlue,
    'chart-2': palette.chartTeal,
    'chart-3': palette.chartGreen,
    'chart-4': palette.chartAmber,
    'chart-5': palette.chartViolet,
    sidebar: palette.sidebarBackground,
    'sidebar-background': palette.sidebarBackground,
    'sidebar-foreground': palette.sidebarForeground,
    'sidebar-primary': palette.sidebarPrimary,
    'sidebar-primary-foreground': palette.sidebarPrimaryForeground,
    'sidebar-accent': palette.sidebarAccent,
    'sidebar-accent-foreground': palette.sidebarAccentForeground,
    'sidebar-border': palette.sidebarBorder,
    'sidebar-ring': palette.sidebarRing,
} as const satisfies ThemeTokenMap;

const DARK_FOREGROUND: OklchValue = HORIZON_BORDER;
const DARK_SURFACE: OklchValue = '0.2101 0.0318 264.66';
const DARK_PRIMARY: OklchValue = '0.5461 0.2152 262.88';
const DARK_SECONDARY: OklchValue = '0.2795 0.0368 260.03';
const DARK_BORDER: OklchValue = '0.3717 0.0392 257.29';
const DARK_ACCENT: OklchValue = HORIZON_ACCENT;
const DARK_ACCENT_FOREGROUND: OklchValue = HORIZON_ACCENT_FOREGROUND;
const DARK_MUTED_FOREGROUND: OklchValue = '0.7107 0.0351 256.79';

export const defaultDarkThemeTokens = {
    background: '0.1802 0.0325 266.62',
    foreground: DARK_FOREGROUND,
    card: DARK_SURFACE,
    'card-foreground': DARK_FOREGROUND,
    popover: DARK_SURFACE,
    'popover-foreground': DARK_FOREGROUND,
    primary: DARK_PRIMARY,
    'primary-foreground': PURE_WHITE,
    secondary: DARK_SECONDARY,
    'secondary-foreground': DARK_FOREGROUND,
    muted: DARK_SECONDARY,
    'muted-foreground': DARK_MUTED_FOREGROUND,
    accent: DARK_ACCENT,
    'accent-foreground': DARK_ACCENT_FOREGROUND,
    destructive: palette.destructive,
    'destructive-foreground': PURE_WHITE,
    border: DARK_BORDER,
    input: DARK_BORDER,
    ring: DARK_PRIMARY,
    'chart-1': palette.chartBlue,
    'chart-2': palette.chartTeal,
    'chart-3': palette.chartGreen,
    'chart-4': palette.chartAmber,
    'chart-5': palette.chartViolet,
    sidebar: DARK_SURFACE,
    'sidebar-background': DARK_SURFACE,
    'sidebar-foreground': DARK_FOREGROUND,
    'sidebar-primary': DARK_PRIMARY,
    'sidebar-primary-foreground': PURE_WHITE,
    'sidebar-accent': DARK_SECONDARY,
    'sidebar-accent-foreground': DARK_FOREGROUND,
    'sidebar-border': DARK_BORDER,
    'sidebar-ring': DARK_PRIMARY,
} as const satisfies ThemeTokenMap;
