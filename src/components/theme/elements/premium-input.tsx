'use client';

import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const transitionEase = 'transition-all duration-200 ease-out';

const premiumInputVariants = cva(
    [
        'w-full rounded-xl px-4 py-2.5',
        'text-foreground placeholder:text-muted-foreground',
        transitionEase,
        'outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' '),
    {
        variants: {
            vibe: {
                glow: [
                    'bg-card/80 border border-primary/30',
                    'shadow-[0_0_10px_oklch(var(--primary)/0.15)]',
                    'focus:border-primary focus:shadow-[0_0_25px_oklch(var(--primary)/0.4)]',
                ].join(' '),
                gradient: [
                    'bg-card/80',
                    'border-2 border-transparent',
                    'bg-clip-padding',
                    '[background:linear-gradient(oklch(var(--card)),oklch(var(--card)))_padding-box,linear-gradient(135deg,oklch(var(--primary)/0.5),oklch(var(--accent)/0.5))_border-box]',
                    'focus:[background:linear-gradient(oklch(var(--card)),oklch(var(--card)))_padding-box,linear-gradient(135deg,oklch(var(--primary)),oklch(var(--accent)))_border-box]',
                ].join(' '),
                glass: [
                    'bg-card/40 backdrop-blur-xl',
                    'border border-border/40',
                    'shadow-lg shadow-primary/5',
                    'focus:bg-card/60 focus:border-primary/40 focus:shadow-[0_0_20px_oklch(var(--primary)/0.2)]',
                ].join(' '),
                outline: [
                    'bg-transparent',
                    'border border-border',
                    'focus:border-primary focus:ring-2 focus:ring-primary/20',
                ].join(' '),
                solid: [
                    'bg-muted/70 border border-transparent',
                    'focus:bg-muted focus:border-primary/30 focus:ring-2 focus:ring-primary/20',
                ].join(' '),
            },
            inputSize: {
                sm: 'h-9 text-sm',
                md: 'h-10 text-sm',
                lg: 'h-11 text-base',
            },
        },
        defaultVariants: {
            vibe: 'outline',
            inputSize: 'md',
        },
    },
);

export type InputVibe = 'glow' | 'gradient' | 'glass' | 'outline' | 'solid';

export interface PremiumInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof premiumInputVariants> {
    vibe?: InputVibe;
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
    ({
        className,
        vibe,
        inputSize,
        label,
        leftIcon,
        rightIcon,
        error,
        errorMessage,
        helperText,
        id,
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const [hasValue, setHasValue] = useState(Boolean(props.defaultValue ?? props.value));
        const generatedId = useId();
        const inputId = id ?? generatedId;
        const isFloating = isFocused || hasValue;
        const helperContent = error ? errorMessage : helperText;

        return (
            <div className="w-full space-y-1.5">
                <div className="relative">
                    {leftIcon ? (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    ) : null}

                    <input
                        ref={ref}
                        id={inputId}
                        data-slot="premium-input"
                        data-vibe={vibe}
                        className={cn(
                            premiumInputVariants({ vibe, inputSize }),
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            label && 'pt-5 pb-1',
                            label && !isFloating && 'placeholder:text-transparent',
                            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                            className,
                        )}
                        placeholder={props.placeholder}
                        onFocus={(event) => {
                            setIsFocused(true);
                            props.onFocus?.(event);
                        }}
                        onBlur={(event) => {
                            setIsFocused(false);
                            setHasValue(Boolean(event.target.value));
                            props.onBlur?.(event);
                        }}
                        onChange={(event) => {
                            setHasValue(Boolean(event.target.value));
                            props.onChange?.(event);
                        }}
                        {...props}
                    />

                    {label ? (
                        <label
                            htmlFor={inputId}
                            className={cn(
                                'absolute left-3 pointer-events-none',
                                transitionEase,
                                leftIcon && 'left-10',
                                isFloating
                                    ? 'top-1.5 text-xs text-primary font-medium'
                                    : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground',
                                error && 'text-destructive',
                            )}
                        >
                            {label}
                        </label>
                    ) : null}

                    {rightIcon ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {rightIcon}
                        </div>
                    ) : null}
                </div>

                {helperContent ? (
                    <p
                        className={cn(
                            'text-xs pl-1',
                            error ? 'text-destructive' : 'text-muted-foreground',
                        )}
                    >
                        {helperContent}
                    </p>
                ) : null}
            </div>
        );
    }
);

PremiumInput.displayName = 'PremiumInput';
