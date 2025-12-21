'use client';

import { forwardRef } from 'react';
import { motion, type MotionProps, type Variants } from 'framer-motion';

import { fadeVariants, slideVariants } from '@/lib/animation/variants';
import type { FadeVariantOptions, SlideVariantOptions } from '@/lib/animation/variants';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

type PrimitiveVariantsBuilder<TOptions> = (options?: TOptions) => Variants;

interface MotionPrimitiveConfig<TOptions> {
    name: string;
    buildVariants: PrimitiveVariantsBuilder<TOptions>;
    defaultFallback?: MotionProps['animate'];
}

type BaseMotionProps<TOptions> = MotionProps & {
    reduceMotionFallback?: MotionProps['animate'];
    variantOptions?: TOptions;
};

function createMotionPrimitive<TOptions>({
    name,
    buildVariants,
    defaultFallback = { opacity: 1 },
}: MotionPrimitiveConfig<TOptions>) {
    const Component = forwardRef<HTMLDivElement, BaseMotionProps<TOptions>>(function MotionPrimitive(
        { reduceMotionFallback = defaultFallback, variantOptions, ...motionProps },
        ref,
    ) {
        const prefersReduced = usePrefersReducedMotion();
        if (prefersReduced) {
            return <motion.div ref={ref} initial={false} animate={reduceMotionFallback} {...motionProps} />;
        }

        return (
            <motion.div
                ref={ref}
                variants={buildVariants(variantOptions)}
                initial="hidden"
                animate="visible"
                exit="exit"
                {...motionProps}
            />
        );
    });

    Component.displayName = name;
    return Component;
}

export type MotionFadeProps = BaseMotionProps<FadeVariantOptions>;
export type MotionSlideProps = BaseMotionProps<SlideVariantOptions>;

export const MotionFade = createMotionPrimitive<FadeVariantOptions>({
    name: 'MotionFade',
    buildVariants: fadeVariants,
    defaultFallback: { opacity: 1 },
});

export const MotionSlide = createMotionPrimitive<SlideVariantOptions>({
    name: 'MotionSlide',
    buildVariants: slideVariants,
    defaultFallback: { opacity: 1 },
});
