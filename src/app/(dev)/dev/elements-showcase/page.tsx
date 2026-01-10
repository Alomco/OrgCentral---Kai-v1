/**
 * dYZ" UI Elements Showcase Page
 * 
 * Demo page for all premium UI elements.
 * Server Component.
 */

import { Star } from 'lucide-react';

import { SlideUp } from '@/components/theme/primitives/motion';
import { ThemeDivider } from '@/components/theme/decorative/effects';
import { PageContainer, PageHeader } from '@/components/theme/layout';

import { ElementsShowcasePrimarySections } from './elements-showcase-primary-sections';
import { ElementsShowcaseSecondarySections } from './elements-showcase-secondary-sections';

export default function ElementsShowcasePage() {
    return (
        <PageContainer padding="lg">
            <div className="space-y-10">
                {/* Header */}
                <SlideUp>
                    <PageHeader
                        title={
                            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                UI Elements
                            </span>
                        }
                        description="Premium components with DOM-level theme support"
                        icon={<Star className="h-6 w-6" />}
                    />
                </SlideUp>

                <ThemeDivider variant="glow" />

                <ElementsShowcasePrimarySections />
                <ElementsShowcaseSecondarySections />
            </div>
        </PageContainer>
    );
}
