/**
 * 🎹 Premium Accordion Component
 * 
 * Enhanced accordion with gradient accents and smooth animations.
 * Server Component wrapper around Radix primitives.
 * 
 * @module components/theme/elements/accordion
 */

import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';

// ============================================================================
// Premium Accordion Item
// ============================================================================

const accordionItemVariants = cva(
    'overflow-hidden transition-all',
    {
        variants: {
            variant: {
                default: 'border-b border-border',
                card: 'rounded-lg border bg-card mb-2 last:mb-0',
                glass: 'rounded-lg border border-border/30 bg-card/50 backdrop-blur-sm mb-2 last:mb-0',
                ghost: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface PremiumAccordionItemProps extends VariantProps<typeof accordionItemVariants> {
    value: string;
    trigger: ReactNode;
    children: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function PremiumAccordionItem({
    value,
    trigger,
    children,
    icon,
    variant,
    className,
}: PremiumAccordionItemProps) {
    return (
        <AccordionItem
            value={value}
            className={cn(accordionItemVariants({ variant }), className)}
            data-slot="premium-accordion-item"
        >
            <AccordionTrigger className={cn(
                'flex w-full items-center justify-between py-4 px-4 text-left font-medium transition-all hover:no-underline',
                variant === 'card' || variant === 'glass' ? 'rounded-t-lg' : '',
            )}>
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {icon}
                        </div>
                    )}
                    <span>{trigger}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className={cn(
                'px-4 pb-4',
                icon && 'pl-[60px]',
            )}>
                {children}
            </AccordionContent>
        </AccordionItem>
    );
}

// ============================================================================
// Premium Accordion Wrapper
// ============================================================================

export interface PremiumAccordionProps {
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    children: ReactNode;
    className?: string;
}

export function PremiumAccordion({
    type = 'single',
    defaultValue,
    children,
    className,
}: PremiumAccordionProps) {
    if (type === 'single') {
        return (
            <Accordion
                type="single"
                defaultValue={defaultValue as string}
                collapsible
                className={className}
                data-slot="premium-accordion"
            >
                {children}
            </Accordion>
        );
    }

    return (
        <Accordion
            type="multiple"
            defaultValue={defaultValue as string[]}
            className={className}
            data-slot="premium-accordion"
        >
            {children}
        </Accordion>
    );
}
