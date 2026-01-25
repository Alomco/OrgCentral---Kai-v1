import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface HrGradientButtonProps {
    children: ReactNode;
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function HrGradientButton({
    children,
    type = 'button',
    disabled = false,
    onClick,
    className,
    size = 'md',
}: HrGradientButtonProps) {
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    } as const;

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'group relative overflow-hidden rounded-lg font-semibold text-white',
                'bg-linear-to-r from-[oklch(var(--primary))] via-[oklch(var(--primary)/0.9)] to-[oklch(var(--accent))]',
                'shadow-lg shadow-[oklch(var(--primary)/0.3)]',
                'transition-all duration-300 ease-out',
                'hover:shadow-xl hover:shadow-[oklch(var(--primary)/0.4)]',
                'hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                sizeStyles[size],
                className,
            )}
        >
            <span
                className={cn(
                    'absolute inset-0 -translate-x-full',
                    'bg-linear-to-r from-transparent via-white/20 to-transparent',
                    'group-hover:animate-[shimmer_1.5s_infinite]',
                )}
            />
            {children}
        </button>
    );
}
