/**
 * dYZr Interactive Elements Showcase
 * 
 * Clean showcase of premium components using project's design system.
 * 
 * @module app/(dev)/dev/premium-showcase
 */

'use client';

import { ThemeDivider } from '@/components/theme/decorative/effects';

import { ButtonsShowcase } from './buttons-showcase';
import { InputsShowcase } from './inputs-showcase';
import { TogglesShowcase } from './toggles-showcase';

export function InteractiveElementsShowcase() {
    return (
        <div className="space-y-16">
            <ButtonsShowcase />
            <ThemeDivider variant="gradient">Inputs &amp; Forms</ThemeDivider>
            <InputsShowcase />
            <ThemeDivider variant="glow">Toggles</ThemeDivider>
            <TogglesShowcase />
        </div>
    );
}
