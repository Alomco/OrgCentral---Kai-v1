import { Download, Plus, Send, Settings, User } from 'lucide-react';

import { PremiumButton } from '@/components/theme/elements';
import { FadeIn, SlideUp } from '@/components/theme/primitives/motion';
import { Heading, Text } from '@/components/theme/primitives/typography';

import { ShowcaseCard } from './showcase-card';

export function ButtonsShowcase() {
    return (
        <section className="space-y-8">
            <SlideUp>
                <Heading size="h2" className="flex items-center gap-3">
                    Premium Buttons
                </Heading>
                <Text color="muted" className="mt-2">
                    Five distinct visual vibes using the tenant theme.
                </Text>
            </SlideUp>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <FadeIn delay={1}>
                    <ShowcaseCard title="Glow" emoji="GL">
                        <div className="space-y-3">
                            <PremiumButton vibe="glow" size="lg" className="w-full">
                                Neon Glow
                            </PremiumButton>
                            <PremiumButton vibe="glow" size="md">
                                <Send className="size-4" /> Send
                            </PremiumButton>
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={2}>
                    <ShowcaseCard title="Gradient" emoji="GR">
                        <div className="space-y-3">
                            <PremiumButton vibe="gradient" size="lg" className="w-full">
                                Rainbow
                            </PremiumButton>
                            <PremiumButton vibe="gradient" size="md">
                                <Download className="size-4" /> Download
                            </PremiumButton>
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={3}>
                    <ShowcaseCard title="Glass" emoji="GLS">
                        <div className="space-y-3">
                            <PremiumButton vibe="glass" size="lg" className="w-full">
                                Frosted
                            </PremiumButton>
                            <PremiumButton vibe="glass" size="md">
                                <Settings className="size-4" /> Settings
                            </PremiumButton>
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={4}>
                    <ShowcaseCard title="Outline" emoji="OUT">
                        <div className="space-y-3">
                            <PremiumButton vibe="outline" size="lg" className="w-full">
                                Bordered
                            </PremiumButton>
                            <PremiumButton vibe="outline" size="md">
                                <Plus className="size-4" /> Add
                            </PremiumButton>
                        </div>
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={5}>
                    <ShowcaseCard title="Solid" emoji="SOL">
                        <div className="space-y-3">
                            <PremiumButton vibe="solid" size="lg" className="w-full">
                                Premium
                            </PremiumButton>
                            <PremiumButton vibe="solid" size="md">
                                <User className="size-4" /> Profile
                            </PremiumButton>
                        </div>
                    </ShowcaseCard>
                </FadeIn>
            </div>
        </section>
    );
}
