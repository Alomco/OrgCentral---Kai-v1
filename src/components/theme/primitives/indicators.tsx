/**
 * Premium Status Indicators
 *
 * Glowing status dots and progress rings with theme colors.
 * Server Components with CVA variants.
 *
 * @module components/theme/primitives/indicators
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Status Dot
// ============================================================================

const statusDotVariants = cva(
    'relative inline-flex rounded-full transition-all duration-300',
    {
        variants: {
            status: {
                online: 'bg-green-500',
                away: 'bg-yellow-500',
                busy: 'bg-orange-500',
                offline: 'bg-muted-foreground',
                error: 'bg-destructive',
            },
            size: {
                sm: 'h-2 w-2',
                md: 'h-2.5 w-2.5',
                lg: 'h-3 w-3',
            },
            glow: {
                true: '',
                false: '',
            },
            pulse: {
                true: 'motion-safe:animate-pulse',
                false: '',
            },
        },
        compoundVariants: [
            { status: 'online', glow: true, className: 'shadow-lg shadow-green-500/50' },
            { status: 'away', glow: true, className: 'shadow-lg shadow-yellow-500/50' },
            { status: 'busy', glow: true, className: 'shadow-lg shadow-orange-500/50' },
            { status: 'error', glow: true, className: 'shadow-lg shadow-destructive/50' },
        ],
        defaultVariants: {
            status: 'offline',
            size: 'md',
            glow: false,
            pulse: false,
        },
    }
);

export interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
    className?: string;
    'aria-label'?: string;
}

/**
 * Status indicator dot with optional glow and pulse effects.
 */
export function StatusDot({
    status,
    size,
    glow,
    pulse,
    className,
    'aria-label': ariaLabel,
}: StatusDotProps) {
    const resolvedStatus = status ?? 'offline';
    return (
        <span
            className={cn(statusDotVariants({ status: resolvedStatus, size, glow, pulse }), className)}
            role="status"
            aria-label={ariaLabel ?? `Status: ${resolvedStatus}`}
        />
    );
}

// ============================================================================
// Progress Ring
// ============================================================================

export interface ProgressRingProps {
    /** Progress value 0-100 */
    progress: number;
    /** Size in pixels */
    size?: number;
    /** Stroke width */
    strokeWidth?: number;
    /** Show percentage text */
    showText?: boolean;
    /** Additional class */
    className?: string;
}

/**
 * Circular progress indicator with gradient stroke.
 */
export function ProgressRing({
    progress,
    size = 48,
    strokeWidth = 4,
    showText = false,
    className,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    fill="none"
                    className="transition-all duration-500 ease-out"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                </defs>
            </svg>
            {showText && (
                <span className="absolute text-xs font-semibold text-foreground">
                    {Math.round(progress)}%
                </span>
            )}
        </div>
    );
}

