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
const HORIZON_FOREGROUND: OklchValue = '0.2200 0.0120 250.00';
const HORIZON_BORDER: OklchValue = '0.9100 0.0080 245.00';
const HORIZON_PRIMARY_BRIGHT: OklchValue = '0.5600 0.1500 245.00';
const HORIZON_ACCENT: OklchValue = '0.7500 0.1400 85.00';
const HORIZON_ACCENT_FOREGROUND: OklchValue = '0.2200 0.0300 250.00';

const palette = {
    white: PURE_WHITE,
    background: '0.9850 0.0020 245.00',
    foreground: HORIZON_FOREGROUND,
    surface: '0.9940 0.0010 245.00',
    muted: '0.9650 0.0050 245.00',
    mutedForeground: '0.5000 0.0180 250.00',
    border: HORIZON_BORDER,
    primary: '0.4800 0.1450 245.00',
    primaryBright: HORIZON_PRIMARY_BRIGHT,
    accent: HORIZON_ACCENT,
    accentForeground: HORIZON_ACCENT_FOREGROUND,
    destructive: '0.6368 0.2078 25.33',
    chartBlue: HORIZON_PRIMARY_BRIGHT,
    chartTeal: '0.7200 0.1200 195.00',
    chartGreen: '0.6800 0.1600 150.00',
    chartAmber: HORIZON_ACCENT,
    chartViolet: '0.5800 0.1600 290.00',
    sidebarBackground: '0.9650 0.0050 245.00',
    sidebarForeground: HORIZON_FOREGROUND,
    sidebarPrimary: '0.4800 0.1450 245.00',
    sidebarPrimaryForeground: PURE_WHITE,
    sidebarAccent: '0.9500 0.0120 245.00',
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

const DARK_FOREGROUND: OklchValue = '0.9200 0.0060 245.00';
const DARK_SURFACE: OklchValue = '0.2000 0.0120 245.00';
const DARK_PRIMARY: OklchValue = '0.5800 0.1700 245.00';
const DARK_SECONDARY: OklchValue = '0.2600 0.0150 245.00';
const DARK_BORDER: OklchValue = '0.3500 0.0150 245.00';
const DARK_ACCENT: OklchValue = HORIZON_ACCENT;
const DARK_ACCENT_FOREGROUND: OklchValue = HORIZON_ACCENT_FOREGROUND;
const DARK_MUTED_FOREGROUND: OklchValue = '0.6800 0.0180 245.00';

export const defaultDarkThemeTokens = {
    background: '0.1600 0.0100 245.00',
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
    'chart-1': '0.5800 0.1600 245.00',
    'chart-2': '0.7400 0.1200 195.00',
    'chart-3': '0.7000 0.1700 150.00',
    'chart-4': '0.7500 0.1400 85.00',
    'chart-5': '0.6000 0.1800 290.00',
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
