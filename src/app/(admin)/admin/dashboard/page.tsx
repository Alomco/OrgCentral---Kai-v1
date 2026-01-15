/**
 * TODO: Refactor this file (currently > 250 LOC).
 * Action: Split into smaller modules and ensure adherence to SOLID principles, Dependency Injection, and Design Patterns.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Briefcase, LayoutDashboard, ShieldCheck, UserPlus, Wrench, Zap } from 'lucide-react';

import { OrgStatsCard, OrgStatsSkeleton } from './org-stats-card';
import { QUICK_ACTIONS } from './quick-actions';
import { ThemeCard } from '@/components/theme/cards/theme-card';
import { ThemeGrid } from '@/components/theme/layout/primitives';
import { ThemeButton, ThemeBadge } from '@/components/theme/primitives/interactive';
import { GradientAccent } from '@/components/theme/primitives/surfaces';
import { PageContainer } from '@/components/theme/layout';
import { GradientOrb } from '@/components/theme/decorative/effects';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';

export const metadata: Metadata = {
    title: 'Global Admin Dashboard - OrgCentral',
    description: 'Platform-wide controls for tenant governance and security.',
};

export default function AdminDashboardPage() {
    return (
        <PageContainer padding="lg" maxWidth="xl" className="relative overflow-hidden">
            {/* Decorative Background Effects */}
            <GradientOrb position="top-right" color="primary" className="opacity-30" />
            <GradientOrb position="bottom-left" color="accent" className="opacity-20" />

            {/* Header */}
            <div className="relative z-10 mb-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Global Admin</p>
                        <h1 className="text-4xl font-bold bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                            Platform Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Manage users, roles, and organization settings.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <ThemeBadge variant="glow" size="lg">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Super Admin
                        </ThemeBadge>
                    </div>
                </div>
            </div>

            {/* Organization Stats */}
            <Suspense fallback={<OrgStatsSkeleton />}>
                <OrgStatsCard />
            </Suspense>

            {/* Quick Actions */}
            <div className="mt-8 relative z-10">
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Actions
                </h2>
                <ThemeGrid cols={3} gap="md">
                    {QUICK_ACTIONS.map((action) => (
                        <Link key={action.href} href={action.href}>
                            <ThemeCard variant="glass" hover="lift" padding="lg" className="h-full cursor-pointer group">
                                <div className="flex items-start gap-4">
                                    <GradientAccent variant="vibrant" rounded="lg" className="p-3 group-hover:scale-110 transition-transform">
                                        <action.icon className="h-5 w-5 text-white" />
                                    </GradientAccent>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </ThemeCard>
                        </Link>
                    ))}
                </ThemeGrid>
            </div>

            {/* Governance & Insights */}
            <div className="mt-8 relative z-10">
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Governance Insights
                </h2>
                <ThemeGrid cols={2} gap="md">
                    <ThemeCard variant="glass" hover="lift" padding="lg" className="h-full">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Compliance readiness</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Key controls aligned with ISO27001 and DSPT frameworks.
                                </p>
                            </div>
                            <ThemeBadge variant="glow" size="sm">On Track</ThemeBadge>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <span>Access reviews</span>
                                <span className="font-medium text-foreground">92% complete</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Audit trails</span>
                                <span className="font-medium text-foreground">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Data residency</span>
                                <span className="font-medium text-foreground">UK-LON</span>
                            </div>
                        </div>
                    </ThemeCard>

                    <ThemeCard variant="glass" hover="lift" padding="lg" className="h-full">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Access governance</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Track privileged access and policy changes.
                                </p>
                            </div>
                            <ThemeBadge variant="outline" size="sm">Last 24h</ThemeBadge>
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <span>Privileged role updates</span>
                                <span className="font-medium text-foreground">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Pending approvals</span>
                                <span className="font-medium text-foreground">1</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Security alerts</span>
                                <span className="font-medium text-foreground">0</span>
                            </div>
                        </div>
                    </ThemeCard>
                </ThemeGrid>
            </div>

            {/* Invite Member CTA */}
            <div className="mt-8 relative z-10">
                <ThemeCard variant="gradient" padding="lg">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <GradientAccent variant="accent" rounded="full" className="p-3">
                                <UserPlus className="h-6 w-6 text-white" />
                            </GradientAccent>
                            <div>
                                <h3 className="font-semibold text-foreground">Invite Team Members</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add new users to your organization with role-based access.
                                </p>
                            </div>
                        </div>
                        <Link href="/org/members">
                            <ThemeButton variant="neon" size="lg" animation="shimmer">
                                <UserPlus className="h-4 w-4" />
                                Invite Members
                            </ThemeButton>
                        </Link>
                    </div>
                </ThemeCard>
            </div>

            {/* Navigation to other dashboards */}
            <div className="mt-8 relative z-10">
                <ThemeCard variant="glass" padding="lg">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Switch Dashboard</p>
                            <p className="text-xs text-muted-foreground mt-1">Navigate to other workspace views.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/dashboard">
                                <ThemeButton variant="outline" size="md">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Employee
                                </ThemeButton>
                            </Link>
                            <Link href="/hr/dashboard">
                                <ThemeButton variant="outline" size="md">
                                    <Briefcase className="h-4 w-4" />
                                    HR
                                </ThemeButton>
                            </Link>
                            <Link href="/dev/dashboard">
                                <ThemeButton variant="outline" size="md">
                                    <Wrench className="h-4 w-4" />
                                    Dev
                                </ThemeButton>
                            </Link>
                        </div>
                    </div>
                </ThemeCard>
            </div>
        </PageContainer>
    );
}
