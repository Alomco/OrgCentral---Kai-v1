/**
 * 🎨 UI Elements Showcase Page
 * 
 * Demo page for all premium UI elements.
 * Server Component.
 */

import {
    Users,
    TrendingUp,
    Calendar,
    FileText,
    Settings,
    Bell,
    CheckCircle,
    AlertCircle,
    Clock,
    Star,
    Inbox,
} from 'lucide-react';

// Elements
import {
    PremiumAvatar,
    AvatarGroup,
    StatCard,
    InlineStat,
    ProgressStat,
    PremiumAccordion,
    PremiumAccordionItem,
    SimpleBarChart,
    SimpleDonutChart,
    Sparkline,
    FeatureCard,
    InfoCard,
    ActionCard,
    DataList,
    KeyValueGrid,
    Timeline,
    EmptyState,
} from '@/components/theme/elements';

// Primitives
import { SlideUp, FadeIn } from '@/components/theme/primitives/motion';
import { Text } from '@/components/theme/primitives/typography';
import { ThemeDivider } from '@/components/theme/decorative/effects';
import { Button } from '@/components/ui/button';
import { PageContainer, PageHeader, Section, ContentGrid } from '@/components/theme/layout';

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

                {/* Avatars */}
                <Section title="👤 Avatars" description="User representations with status indicators">
                    <div className="flex flex-wrap items-end gap-6">
                        <PremiumAvatar size="xs" fallback="XS" status="online" />
                        <PremiumAvatar size="sm" fallback="SM" status="away" />
                        <PremiumAvatar size="md" fallback="MD" status="busy" ring="primary" />
                        <PremiumAvatar size="lg" fallback="LG" status="offline" ring="gradient" />
                        <PremiumAvatar size="xl" fallback="XL" interactive />
                        <AvatarGroup>
                            <PremiumAvatar fallback="A" ring="default" />
                            <PremiumAvatar fallback="B" ring="default" />
                            <PremiumAvatar fallback="C" ring="default" />
                        </AvatarGroup>
                    </div>
                </Section>

                {/* Stats */}
                <Section title="📊 Statistics" description="Data metrics and KPIs">
                    <ContentGrid cols={4}>
                        <FadeIn>
                            <StatCard
                                label="Total Employees"
                                value="1,234"
                                trend="up"
                                trendValue="+12%"
                                icon={<Users className="h-5 w-5" />}
                            />
                        </FadeIn>
                        <FadeIn delay={1}>
                            <StatCard
                                label="Active Projects"
                                value="45"
                                trend="up"
                                trendValue="+5"
                                icon={<FileText className="h-5 w-5" />}
                                variant="glass"
                            />
                        </FadeIn>
                        <FadeIn delay={2}>
                            <StatCard
                                label="Attendance Rate"
                                value="98.5%"
                                trend="neutral"
                                trendValue="0%"
                                icon={<Calendar className="h-5 w-5" />}
                                variant="gradient"
                            />
                        </FadeIn>
                        <FadeIn delay={3}>
                            <StatCard
                                label="Revenue"
                                value="$52K"
                                trend="up"
                                trendValue="+23%"
                                icon={<TrendingUp className="h-5 w-5" />}
                                variant="solid"
                            />
                        </FadeIn>
                    </ContentGrid>

                    <div className="grid gap-4 md:grid-cols-3 mt-6">
                        <InlineStat label="Pending Tasks" value="12" icon={<Clock className="h-4 w-4" />} />
                        <InlineStat label="Notifications" value="5" icon={<Bell className="h-4 w-4" />} />
                        <InlineStat label="Completed" value="89" icon={<CheckCircle className="h-4 w-4" />} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mt-6">
                        <ProgressStat label="Storage Used" current={7.2} max={10} unit="GB" />
                        <ProgressStat label="Monthly Goal" current={75} max={100} unit="%" />
                    </div>
                </Section>

                {/* Charts */}
                <Section title="📈 Charts" description="Simple data visualizations">
                    <ContentGrid cols={3}>
                        <FadeIn>
                            <div className="rounded-lg border bg-card p-4">
                                <Text weight="medium" className="mb-4">Bar Chart</Text>
                                <SimpleBarChart
                                    data={[
                                        { label: 'Mon', value: 40 },
                                        { label: 'Tue', value: 65 },
                                        { label: 'Wed', value: 50 },
                                        { label: 'Thu', value: 80 },
                                        { label: 'Fri', value: 55 },
                                    ]}
                                />
                            </div>
                        </FadeIn>
                        <FadeIn delay={1}>
                            <div className="rounded-lg border bg-card p-4 flex flex-col items-center">
                                <Text weight="medium" className="mb-4 self-start">Donut Chart</Text>
                                <SimpleDonutChart value={72} label="Complete" />
                            </div>
                        </FadeIn>
                        <FadeIn delay={2}>
                            <div className="rounded-lg border bg-card p-4">
                                <Text weight="medium" className="mb-4">Sparkline</Text>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <Text size="lg" weight="semibold">$4,523</Text>
                                        <Text color="muted" size="sm">Revenue today</Text>
                                    </div>
                                    <Sparkline data={[30, 45, 35, 60, 50, 70, 55]} width={100} height={40} />
                                </div>
                            </div>
                        </FadeIn>
                    </ContentGrid>
                </Section>

                {/* Cards */}
                <Section title="🃏 Cards" description="Feature and info cards">
                    <ContentGrid cols={3}>
                        <FeatureCard
                            icon={<Settings className="h-5 w-5" />}
                            title="Settings"
                            description="Configure your workspace preferences"
                            variant="default"
                            interactive
                        />
                        <FeatureCard
                            icon={<Users className="h-5 w-5" />}
                            title="Team"
                            description="Manage your team members"
                            variant="glass"
                            interactive
                        />
                        <FeatureCard
                            icon={<Bell className="h-5 w-5" />}
                            title="Notifications"
                            description="Stay updated with alerts"
                            variant="gradient"
                            interactive
                        />
                    </ContentGrid>

                    <div className="grid gap-4 md:grid-cols-2 mt-6">
                        <InfoCard label="Status" value="Active" icon={<CheckCircle className="h-4 w-4" />} variant="success" />
                        <InfoCard label="Warning" value="Low storage" icon={<AlertCircle className="h-4 w-4" />} variant="warning" />
                    </div>

                    <ActionCard
                        title="Enable notifications"
                        description="Get alerts for important updates"
                        action={<Button size="sm">Enable</Button>}
                        className="mt-4"
                    />
                </Section>

                {/* Accordion */}
                <Section title="🎹 Accordion" description="Expandable content sections">
                    <PremiumAccordion type="single" defaultValue="item-1">
                        <PremiumAccordionItem
                            value="item-1"
                            trigger="How does billing work?"
                            icon={<FileText className="h-4 w-4" />}
                            variant="card"
                        >
                            <Text color="muted" size="sm">
                                We bill monthly based on your usage. You can upgrade or downgrade anytime.
                            </Text>
                        </PremiumAccordionItem>
                        <PremiumAccordionItem
                            value="item-2"
                            trigger="Can I cancel anytime?"
                            icon={<Settings className="h-4 w-4" />}
                            variant="card"
                        >
                            <Text color="muted" size="sm">
                                Yes, you can cancel your subscription at any time. No questions asked.
                            </Text>
                        </PremiumAccordionItem>
                    </PremiumAccordion>
                </Section>

                {/* Data Display */}
                <Section title="📋 Data Display" description="Lists, grids, and timelines">
                    <ContentGrid cols={2}>
                        <div className="rounded-lg border bg-card">
                            <DataList
                                items={[
                                    { label: 'Name', value: 'John Doe' },
                                    { label: 'Email', value: 'john@example.com' },
                                    { label: 'Role', value: 'Administrator' },
                                    { label: 'Status', value: 'Active' },
                                ]}
                                variant="striped"
                            />
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <KeyValueGrid
                                items={[
                                    { label: 'Department', value: 'Engineering' },
                                    { label: 'Location', value: 'San Francisco' },
                                    { label: 'Start Date', value: 'Jan 2024' },
                                    { label: 'Manager', value: 'Jane Smith' },
                                ]}
                            />
                        </div>
                    </ContentGrid>

                    <div className="rounded-lg border bg-card p-6 mt-6">
                        <Text weight="medium" className="mb-4">Timeline</Text>
                        <Timeline
                            items={[
                                { title: 'Project Started', timestamp: '2 days ago', variant: 'success' },
                                { title: 'Design Review', description: 'Completed design phase', timestamp: 'Yesterday', variant: 'success' },
                                { title: 'Development', description: 'In progress', timestamp: 'Today' },
                                { title: 'Testing', timestamp: 'Pending', variant: 'warning' },
                            ]}
                        />
                    </div>
                </Section>

                {/* Empty State */}
                <Section title="📭 Empty State">
                    <div className="rounded-lg border bg-card">
                        <EmptyState
                            icon={<Inbox className="h-8 w-8" />}
                            title="No items yet"
                            description="Get started by creating your first item"
                            action={<Button>Create Item</Button>}
                        />
                    </div>
                </Section>
            </div>
        </PageContainer>
    );
}
