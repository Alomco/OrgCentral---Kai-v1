/**
 * 💀 Premium Skeleton Components
 * 
 * Shimmer loading placeholders with optional glow.
 * Server Components - pure CSS animation.
 * 
 * @module components/theme/primitives/skeletons
 */

import { cn } from '@/lib/utils';
import styles from './skeletons.module.css';

// ============================================================================
// Types
// ============================================================================

export interface PremiumSkeletonProps {
    /** Additional class name for sizing */
    className?: string;
    /** Add subtle glow effect */
    glow?: boolean;
    /** Use subtle shimmer variant */
    subtle?: boolean;
}

// ============================================================================
// Premium Skeleton
// ============================================================================

/**
 * Single skeleton element with shimmer animation.
 */
export function PremiumSkeleton({
    className,
    glow = false,
    subtle = false,
}: PremiumSkeletonProps) {
    return (
        <div
            className={cn(
                subtle ? styles.skeletonSubtle : styles.skeleton,
                glow && styles.skeletonGlow,
                className,
            )}
        />
    );
}

// ============================================================================
// Preset Skeletons
// ============================================================================

/**
 * Card content skeleton with title, description, and body.
 */
export function CardSkeleton() {
    return (
        <div className="space-y-4 p-6">
            <PremiumSkeleton className="h-5 w-1/3" />
            <PremiumSkeleton className="h-3 w-2/3" subtle />
            <div className="pt-2">
                <PremiumSkeleton className="h-20 w-full" glow />
            </div>
            <div className="flex gap-2 pt-2">
                <PremiumSkeleton className="h-8 w-20" />
                <PremiumSkeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

/**
 * Text block skeleton for paragraphs.
 */
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
                <PremiumSkeleton
                    key={index}
                    className={cn('h-3', index === lines - 1 ? 'w-4/5' : 'w-full')}
                    subtle
                />
            ))}
        </div>
    );
}

/**
 * Avatar skeleton with optional text.
 */
export function AvatarSkeleton({ withText = false }: { withText?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <PremiumSkeleton className="h-10 w-10 rounded-full" />
            {withText && (
                <div className="space-y-1.5">
                    <PremiumSkeleton className="h-3 w-24" />
                    <PremiumSkeleton className="h-2.5 w-16" subtle />
                </div>
            )}
        </div>
    );
}
