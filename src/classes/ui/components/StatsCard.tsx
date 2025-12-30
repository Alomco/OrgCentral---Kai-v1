/**
 * 📊 Stats Card Component using Class-Based Architecture
 * 
 * Example implementation of a stats card that extends BaseCardComponent.
 * Demonstrates how to use the class-based UI system.
 * 
 * @module classes/ui/components/StatsCard
 */

import { type ReactNode } from 'react';
import { BaseStatWidget } from '../BaseUIComponent';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface StatsCardProps {
    /** Card title */
    title: string;
    /** Main value to display */
    value: string | number;
    /** Optional trend indicator (e.g., "+12%") */
    trend?: string;
    /** Trend direction for coloring */
    trendDirection?: 'up' | 'down' | 'neutral';
    /** Optional icon */
    icon?: ReactNode;
    /** Additional className */
    className?: string;
}

// ============================================================================
// Component Class
// ============================================================================

export class StatsCard extends BaseStatWidget<StatsCardProps> {

    /**
     * Get trend color based on direction
     */
    private getTrendColor(): string {
        switch (this.props.trendDirection) {
            case 'up':
                return 'text-emerald-500 bg-emerald-500/10';
            case 'down':
                return 'text-red-500 bg-red-500/10';
            default:
                return 'text-muted-foreground bg-muted';
        }
    }

    /**
     * Render the card content
     */
    renderContent(): ReactNode {
        const { title, value, trend, icon } = this.props;

        return (
            <div className="flex flex-col gap-2">
                {/* Header with icon */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground tracking-wide">
                        {title}
                    </h3>
                    {icon && (
                        <div className="text-muted-foreground">
                            {icon}
                        </div>
                    )}
                </div>

                {/* Value and trend */}
                <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-foreground">
                        {value}
                    </span>

                    {trend && (
                        <span className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            this.getTrendColor()
                        )}>
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

// ============================================================================
// Factory Function (for easier React integration)
// ============================================================================

/**
 * Create a StatsCard component.
 * Use this instead of `new StatsCard(...).render()` for cleaner JSX.
 */
export function createStatsCard(props: StatsCardProps): ReactNode {
    return new StatsCard(props).render();
}
