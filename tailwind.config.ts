import type { Config } from 'tailwindcss';

const cssVariable = (value: string): string => `var(--${value})`;

export default {
    darkMode: ['class', '.dark'],
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/features/**/*.{js,ts,jsx,tsx,mdx}',
        './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: cssVariable('background'),
                foreground: cssVariable('foreground'),
                card: {
                    DEFAULT: cssVariable('card'),
                    foreground: cssVariable('card-foreground'),
                },
                popover: {
                    DEFAULT: cssVariable('popover'),
                    foreground: cssVariable('popover-foreground'),
                },
                primary: {
                    DEFAULT: cssVariable('primary'),
                    foreground: cssVariable('primary-foreground'),
                },
                secondary: {
                    DEFAULT: cssVariable('secondary'),
                    foreground: cssVariable('secondary-foreground'),
                },
                muted: {
                    DEFAULT: cssVariable('muted'),
                    foreground: cssVariable('muted-foreground'),
                },
                accent: {
                    DEFAULT: cssVariable('accent'),
                    foreground: cssVariable('accent-foreground'),
                },
                destructive: {
                    DEFAULT: cssVariable('destructive'),
                    foreground: cssVariable('destructive-foreground'),
                },
                border: cssVariable('border'),
                input: cssVariable('input'),
                ring: cssVariable('ring'),
                chart: {
                    1: cssVariable('chart-1'),
                    2: cssVariable('chart-2'),
                    3: cssVariable('chart-3'),
                    4: cssVariable('chart-4'),
                    5: cssVariable('chart-5'),
                },
                sidebar: {
                    DEFAULT: cssVariable('sidebar'),
                    foreground: cssVariable('sidebar-foreground'),
                    primary: cssVariable('sidebar-primary'),
                    'primary-foreground': cssVariable('sidebar-primary-foreground'),
                    accent: cssVariable('sidebar-accent'),
                    'accent-foreground': cssVariable('sidebar-accent-foreground'),
                    border: cssVariable('sidebar-border'),
                    ring: cssVariable('sidebar-ring'),
                },
            },
            borderRadius: {
                lg: cssVariable('radius'),
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
                    '50%': { opacity: '0.6', transform: 'scale(1.05)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.6s ease-out',
                'blob': 'blob 7s infinite',
                'shimmer': 'shimmer 2s infinite linear',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config;
