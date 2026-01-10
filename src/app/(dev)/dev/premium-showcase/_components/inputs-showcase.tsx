'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Search, User } from 'lucide-react';

import { PremiumInput } from '@/components/theme/elements';
import { FadeIn, SlideUp } from '@/components/theme/primitives/motion';
import { Heading, Text } from '@/components/theme/primitives/typography';

import { ShowcaseCard } from './showcase-card';

export function InputsShowcase() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <section className="space-y-8">
            <SlideUp>
                <Heading size="h2" className="flex items-center gap-3">
                    Premium Inputs
                </Heading>
                <Text color="muted" className="mt-2">
                    Floating labels, icons, and five distinct styles.
                </Text>
            </SlideUp>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FadeIn delay={1}>
                    <ShowcaseCard title="Glow Input" emoji="GL">
                        <PremiumInput
                            vibe="glow"
                            label="Email Address"
                            placeholder="you@example.com"
                            leftIcon={<Mail className="size-4" />}
                        />
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={2}>
                    <ShowcaseCard title="Gradient Input" emoji="GR">
                        <PremiumInput
                            vibe="gradient"
                            label="Search"
                            placeholder="Type to search..."
                            leftIcon={<Search className="size-4" />}
                        />
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={3}>
                    <ShowcaseCard title="Glass Input" emoji="GLS">
                        <PremiumInput
                            vibe="glass"
                            label="Username"
                            placeholder="@yourname"
                            leftIcon={<User className="size-4" />}
                            helperText="Your unique identifier"
                        />
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={4}>
                    <ShowcaseCard title="Outline Input" emoji="OUT">
                        <PremiumInput
                            vibe="outline"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********"
                            leftIcon={<Lock className="size-4" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((current) => !current)}
                                    className="transition-colors hover:text-primary"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            }
                        />
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={5}>
                    <ShowcaseCard title="Solid Input" emoji="SOL">
                        <PremiumInput
                            vibe="solid"
                            label="Full Name"
                            placeholder="John Doe"
                            leftIcon={<User className="size-4" />}
                        />
                    </ShowcaseCard>
                </FadeIn>

                <FadeIn delay={5}>
                    <ShowcaseCard title="Error State" emoji="ERR">
                        <PremiumInput
                            vibe="outline"
                            label="Email"
                            defaultValue="invalid"
                            error
                            errorMessage="Please enter a valid email"
                            leftIcon={<Mail className="size-4" />}
                        />
                    </ShowcaseCard>
                </FadeIn>
            </div>
        </section>
    );
}
