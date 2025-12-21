import type { Transition, Variants } from 'framer-motion';

import { animationDurations, animationEasings } from './tokens';

type Direction = 'up' | 'down' | 'left' | 'right';

export interface SlideVariantOptions {
    distance?: number;
    direction?: Direction;
    duration?: keyof typeof animationDurations;
}

export interface FadeVariantOptions {
    scale?: number;
    duration?: keyof typeof animationDurations;
}

const makeTransition = (
    duration: keyof typeof animationDurations = 'base',
    ease: keyof typeof animationEasings = 'standard',
): Transition => ({
    duration: animationDurations[duration],
    ease: animationEasings[ease],
});

export const fadeVariants = ({
    scale = 0.98,
    duration = 'base',
}: FadeVariantOptions = {}): Variants => ({
    hidden: { opacity: 0, scale },
    visible: { opacity: 1, scale: 1, transition: makeTransition(duration, 'entrance') },
    exit: { opacity: 0, scale, transition: makeTransition(duration, 'exit') },
});

const directionAxis: Record<Direction, 'x' | 'y'> = {
    up: 'y',
    down: 'y',
    left: 'x',
    right: 'x',
};

const directionMultiplier: Record<Direction, 1 | -1> = {
    up: 1,
    left: 1,
    down: -1,
    right: -1,
};

export const slideVariants = ({
    direction = 'up',
    distance = 16,
    duration = 'base',
}: SlideVariantOptions = {}): Variants => {
    const axis = directionAxis[direction];
    const multiplier = directionMultiplier[direction];
    return {
        hidden: { opacity: 0, [axis]: multiplier * distance },
        visible: {
            opacity: 1,
            [axis]: 0,
            transition: makeTransition(duration, 'entrance'),
        },
        exit: {
            opacity: 0,
            [axis]: multiplier * distance,
            transition: makeTransition(duration, 'exit'),
        },
    } as Variants;
};

export const scaleTransition: Transition = {
    duration: animationDurations.fast,
    ease: animationEasings.emphasized,
};
