/**
 * 📊 Premium Chart Primitives
 * 
 * Simple chart visualizations without heavy dependencies.
 * CSS-first with theme integration.
 * 
 * @module components/theme/elements/charts
 */

import { cn } from '@/lib/utils';

// ============================================================================
// Bar Chart (Simple)
// ============================================================================

export interface BarChartItem {
    label: string;
    value: number;
    color?: string;
}

export interface SimpleBarChartProps {
    data: BarChartItem[];
    maxValue?: number;
    showLabels?: boolean;
    horizontal?: boolean;
    className?: string;
}

export function SimpleBarChart({
    data,
    maxValue,
    showLabels = true,
    horizontal = false,
    className,
}: SimpleBarChartProps) {
    const max = maxValue ?? Math.max(...data.map((d) => d.value));

    if (horizontal) {
        return (
            <div className={cn('space-y-3', className)} data-slot="bar-chart">
                {data.map((item, index) => {
                    const percentage = (item.value / max) * 100;
                    return (
                        <div key={index} className="space-y-1">
                            {showLabels && (
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{item.label}</span>
                                    <span className="text-muted-foreground">{item.value}</span>
                                </div>
                            )}
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${percentage.toFixed(2)}%`,
                                        background: item.color ?? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={cn('flex items-end gap-2 h-32', className)} data-slot="bar-chart">
            {data.map((item, index) => {
                const percentage = (item.value / max) * 100;
                return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-1">
                        <div className="w-full flex-1 flex items-end">
                            <div
                                className="w-full rounded-t transition-all duration-500"
                                style={{
                                    height: `${percentage.toFixed(2)}%`,
                                    background: item.color ?? 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)))',
                                }}
                            />
                        </div>
                        {showLabels && (
                            <span className="text-xs text-muted-foreground truncate max-w-full">
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================================
// Donut Chart (Simple)
// ============================================================================

export interface DonutChartProps {
    value: number;
    max?: number;
    size?: number;
    thickness?: number;
    label?: string;
    className?: string;
}

export function SimpleDonutChart({
    value,
    max = 100,
    size = 120,
    thickness = 12,
    label,
    className,
}: DonutChartProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - thickness) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)} data-slot="donut-chart">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={thickness}
                    fill="none"
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#donutGradient)"
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    fill="none"
                    className="transition-all duration-700 ease-out"
                />
                <defs>
                    <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
                {label && <span className="text-xs text-muted-foreground">{label}</span>}
            </div>
        </div>
    );
}

// ============================================================================
// Sparkline
// ============================================================================

export interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    className?: string;
}

export function Sparkline({ data, width = 100, height = 32, className }: SparklineProps) {
    if (data.length < 2) {return null;}

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${String(x)},${String(y)}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className={className} data-slot="sparkline">
            <polyline
                points={points}
                fill="none"
                stroke="url(#sparklineGradient)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
            </defs>
        </svg>
    );
}
