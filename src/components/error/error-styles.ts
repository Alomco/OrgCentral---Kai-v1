import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Error page card variants using CVA pattern.
 * Provides consistent styling across all error pages with variant-based theming.
 */
export const errorCardVariants = cva(
    [
        'relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-[oklch(var(--background))] via-[oklch(var(--card))] to-[oklch(var(--muted))]',
        'p-8 shadow-[0_25px_80px_-30px_oklch(var(--primary)/0.4)]',
        'motion-reduce:transition-none',
    ],
    {
        variants: {
            intent: {
                danger: 'shadow-[0_25px_80px_-30px_oklch(var(--destructive)/0.35)]',
                warning: 'shadow-[0_25px_80px_-30px_oklch(var(--chart-4)/0.35)]',
                info: 'shadow-[0_25px_80px_-30px_oklch(var(--primary)/0.4)]',
            },
        },
        defaultVariants: {
            intent: 'danger',
        },
    },
);

export const errorTitleVariants = cva(
    [
        'bg-clip-text text-transparent',
        'text-3xl font-semibold tracking-tight',
        'text-shadow-[0_12px_40px_oklch(var(--primary)/0.2)]',
    ],
    {
        variants: {
            intent: {
                danger: 'bg-gradient-to-r from-[oklch(var(--destructive))] via-[oklch(var(--accent))] to-[oklch(var(--primary))]',
                warning: 'bg-gradient-to-r from-[oklch(var(--chart-4))] via-[oklch(var(--chart-5))] to-[oklch(var(--accent))]',
                info: 'bg-gradient-to-r from-[oklch(var(--primary))] via-[oklch(var(--accent))] to-[oklch(var(--chart-3))]',
            },
        },
        defaultVariants: {
            intent: 'danger',
        },
    },
);

export type ErrorCardIntent = VariantProps<typeof errorCardVariants>['intent'];
