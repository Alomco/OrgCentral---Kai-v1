/**
 * 🎨 Premium UI Showcase Page
 * 
 * Demo page for all premium visual artifacts.
 * Server Component with nested Suspense.
 */

import { Sparkles, Star, Zap, Heart, Settings, User } from 'lucide-react';

// Decorative
import { RotatingBorderCard, NeonBorderCard, GradientBorderCard } from '@/components/theme/decorative/borders';
import { FloatingParticles } from '@/components/theme/decorative/particles';
import { GradientOrb, ThemeDivider } from '@/components/theme/decorative/effects';

// Primitives
import { StatusDot, ProgressRing } from '@/components/theme/primitives/indicators';
import { PremiumSkeleton, CardSkeleton, AvatarSkeleton } from '@/components/theme/primitives/skeletons';
import { FadeIn, SlideUp, ScaleIn, BounceIn } from '@/components/theme/primitives/motion';
import { Heading, Text, Caption } from '@/components/theme/primitives/typography';
import { IconContainer } from '@/components/theme/primitives/icon-container';
import { GradientText } from '@/components/theme/primitives/text-effects';

export default function PremiumShowcasePage() {
    return (
        <div className="relative min-h-screen overflow-hidden p-8">
            {/* Background effects */}
            <GradientOrb position="top-right" color="primary" />
            <GradientOrb position="bottom-left" color="accent" />

            <div className="relative z-10 mx-auto max-w-6xl space-y-12">
                {/* Header */}
                <SlideUp>
                    <div className="text-center space-y-4">
                        <Caption>Premium UI System</Caption>
                        <Heading size="h1" gradient="vibrant">
                            ✨ Futuristic Artifacts
                        </Heading>
                        <Text color="muted" size="lg">
                            Beautiful, theme-aware components for your enterprise application
                        </Text>
                    </div>
                </SlideUp>

                <ThemeDivider variant="glow" />

                {/* Animated Borders Section */}
                <section className="space-y-6">
                    <Heading size="h3">🌀 Animated Borders</Heading>
                    <div className="grid gap-6 md:grid-cols-3">
                        <FadeIn delay={1}>
                            <RotatingBorderCard>
                                <FloatingParticles count={4} />
                                <div className="relative space-y-3">
                                    <IconContainer variant="gradient" size="lg">
                                        <Sparkles />
                                    </IconContainer>
                                    <Heading size="h5">Rotating Border</Heading>
                                    <Text color="muted" size="sm">
                                        Continuous gradient animation
                                    </Text>
                                </div>
                            </RotatingBorderCard>
                        </FadeIn>

                        <FadeIn delay={2}>
                            <NeonBorderCard>
                                <div className="space-y-3">
                                    <IconContainer variant="glow" size="lg">
                                        <Zap />
                                    </IconContainer>
                                    <Heading size="h5">Neon Border</Heading>
                                    <Text color="muted" size="sm">
                                        Pulsing cyberpunk glow
                                    </Text>
                                </div>
                            </NeonBorderCard>
                        </FadeIn>

                        <FadeIn delay={3}>
                            <GradientBorderCard>
                                <div className="space-y-3">
                                    <IconContainer variant="solid" size="lg">
                                        <Star />
                                    </IconContainer>
                                    <Heading size="h5">Gradient Border</Heading>
                                    <Text color="muted" size="sm">
                                        Static accent border
                                    </Text>
                                </div>
                            </GradientBorderCard>
                        </FadeIn>
                    </div>
                </section>

                <ThemeDivider variant="gradient">Indicators</ThemeDivider>

                {/* Status & Progress Section */}
                <section className="space-y-6">
                    <Heading size="h3">🔮 Status Indicators</Heading>
                    <div className="flex flex-wrap items-center gap-8">
                        <ScaleIn>
                            <div className="flex items-center gap-3">
                                <StatusDot status="online" glow pulse />
                                <Text size="sm">Online</Text>
                            </div>
                        </ScaleIn>
                        <ScaleIn delay={1}>
                            <div className="flex items-center gap-3">
                                <StatusDot status="away" glow />
                                <Text size="sm">Away</Text>
                            </div>
                        </ScaleIn>
                        <ScaleIn delay={2}>
                            <div className="flex items-center gap-3">
                                <StatusDot status="busy" glow />
                                <Text size="sm">Busy</Text>
                            </div>
                        </ScaleIn>
                        <ScaleIn delay={3}>
                            <div className="flex items-center gap-3">
                                <StatusDot status="error" glow pulse />
                                <Text size="sm">Error</Text>
                            </div>
                        </ScaleIn>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 pt-4">
                        <BounceIn>
                            <div className="flex flex-col items-center gap-2">
                                <ProgressRing progress={25} showText />
                                <Caption>25%</Caption>
                            </div>
                        </BounceIn>
                        <BounceIn delay={1}>
                            <div className="flex flex-col items-center gap-2">
                                <ProgressRing progress={50} size={56} showText />
                                <Caption>50%</Caption>
                            </div>
                        </BounceIn>
                        <BounceIn delay={2}>
                            <div className="flex flex-col items-center gap-2">
                                <ProgressRing progress={75} size={64} showText />
                                <Caption>75%</Caption>
                            </div>
                        </BounceIn>
                        <BounceIn delay={3}>
                            <div className="flex flex-col items-center gap-2">
                                <ProgressRing progress={100} size={72} showText />
                                <Caption>100%</Caption>
                            </div>
                        </BounceIn>
                    </div>
                </section>

                <ThemeDivider variant="gradient">Typography</ThemeDivider>

                {/* Typography Section */}
                <section className="space-y-6">
                    <Heading size="h3">📝 Gradient Typography</Heading>
                    <div className="space-y-4">
                        <SlideUp>
                            <GradientText gradient="primary" animated className="text-4xl font-bold">
                                Primary Animated Gradient
                            </GradientText>
                        </SlideUp>
                        <SlideUp delay={1}>
                            <GradientText gradient="vibrant" animated className="text-3xl font-bold">
                                Vibrant Multi-Color Shift
                            </GradientText>
                        </SlideUp>
                        <SlideUp delay={2}>
                            <GradientText gradient="rainbow" className="text-2xl font-bold">
                                Rainbow Spectrum
                            </GradientText>
                        </SlideUp>
                    </div>
                </section>

                <ThemeDivider variant="gradient">Icons</ThemeDivider>

                {/* Icon Containers Section */}
                <section className="space-y-6">
                    <Heading size="h3">📦 Icon Containers</Heading>
                    <div className="flex flex-wrap items-center gap-4">
                        <IconContainer variant="solid" size="lg"><Heart /></IconContainer>
                        <IconContainer variant="gradient" size="lg"><Star /></IconContainer>
                        <IconContainer variant="glass" size="lg"><Settings /></IconContainer>
                        <IconContainer variant="glow" size="lg"><Zap /></IconContainer>
                        <IconContainer variant="muted" size="lg"><User /></IconContainer>
                        <IconContainer variant="outline" size="lg"><Sparkles /></IconContainer>
                    </div>
                </section>

                <ThemeDivider variant="gradient">Skeletons</ThemeDivider>

                {/* Skeleton Loaders Section */}
                <section className="space-y-6">
                    <Heading size="h3">💀 Premium Skeletons</Heading>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border bg-card p-4">
                            <CardSkeleton />
                        </div>
                        <div className="space-y-4 rounded-lg border bg-card p-6">
                            <AvatarSkeleton withText />
                            <PremiumSkeleton className="h-4 w-full" />
                            <PremiumSkeleton className="h-4 w-3/4" subtle />
                            <PremiumSkeleton className="h-20 w-full" glow />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
