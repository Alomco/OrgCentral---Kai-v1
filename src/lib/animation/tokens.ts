export type CubicBezier = [number, number, number, number];

type DurationMap = Record<'instant' | 'fast' | 'base' | 'slow', number>;
type DelayMap = Record<'none' | 'short' | 'medium', number>;

type EasingMap = Record<'standard' | 'emphasized' | 'entrance' | 'exit', CubicBezier>;

type SpringMap = Record<'gentle' | 'snappy', { stiffness: number; damping: number; mass: number }>;

/**
 * Centralized animation tokens keep CSS transitions, Tailwind utilities, and Framer Motion
 * presets in sync without scattering "magic" numbers across the UI layer.
 */
export const animationDurations: DurationMap = {
    instant: 0.12,
    fast: 0.18,
    base: 0.26,
    slow: 0.4,
};

export const animationDelays: DelayMap = {
    none: 0,
    short: 0.05,
    medium: 0.1,
};

export const animationEasings: EasingMap = {
    standard: [0.2, 0, 0, 1],
    emphasized: [0.2, 0.7, 0, 1],
    entrance: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
};

export const animationSprings: SpringMap = {
    gentle: { stiffness: 120, damping: 22, mass: 1 },
    snappy: { stiffness: 210, damping: 28, mass: 0.8 },
};

export interface MotionTiming {
    duration?: number;
    delay?: number;
    ease?: CubicBezier;
}

export function getTimingPreset(
    preset: keyof DurationMap = 'base',
    easing: keyof EasingMap = 'standard',
): MotionTiming {
    return {
        duration: animationDurations[preset],
        ease: animationEasings[easing],
    };
}
