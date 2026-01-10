import { PremiumToggle } from '@/components/theme/elements';
import { FadeIn, SlideUp } from '@/components/theme/primitives/motion';
import { Heading, Text } from '@/components/theme/primitives/typography';

import { ShowcaseCard } from './showcase-card';

export function TogglesShowcase() {
    return (
        <section className="space-y-8">
            <SlideUp>
                <Heading size="h2" className="flex items-center gap-3">
                    Premium Toggles
                </Heading>
                <Text color="muted" className="mt-2">
                    Smooth animations with five unique styles.
                </Text>
            </SlideUp>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <FadeIn delay={1}>
                    <ShowcaseCard title="Glow" emoji="GL">
                        <div className="space-y-3">
                            <PremiumToggle vibe="glow" label="Enable glow" defaultChecked />
                            <PremiumToggle vibe="glow" label="Disabled" size="sm" />
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={2}>
                    <ShowcaseCard title="Gradient" emoji="GR">
                        <div className="space-y-3">
                            <PremiumToggle vibe="gradient" label="Rainbow mode" defaultChecked />
                            <PremiumToggle vibe="gradient" label="Off state" />
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={3}>
                    <ShowcaseCard title="Glass" emoji="GLS">
                        <div className="space-y-3">
                            <PremiumToggle vibe="glass" label="Blur effect" defaultChecked />
                            <PremiumToggle vibe="glass" label="Inactive" />
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={4}>
                    <ShowcaseCard title="Outline" emoji="OUT">
                        <div className="space-y-3">
                            <PremiumToggle vibe="outline" label="Bordered" defaultChecked />
                            <PremiumToggle vibe="outline" label="Minimal" />
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={5}>
                    <ShowcaseCard title="Solid" emoji="SOL">
                        <div className="space-y-3">
                            <PremiumToggle vibe="solid" label="Enabled" defaultChecked />
                            <PremiumToggle vibe="solid" label="Compact" size="sm" />
                        </div>
                    </ShowcaseCard>
                </FadeIn>
            </div>
        </section>
    );
}
