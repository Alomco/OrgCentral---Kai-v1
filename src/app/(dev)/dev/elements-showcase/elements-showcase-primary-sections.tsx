import {
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    TrendingUp,
    Users,
} from 'lucide-react';

import {
    AvatarGroup,
    InlineStat,
    PremiumAvatar,
    ProgressStat,
    SimpleBarChart,
    SimpleDonutChart,
    Sparkline,
    StatCard,
} from '@/components/theme/elements';
import { FadeIn } from '@/components/theme/primitives/motion';
import { Text } from '@/components/theme/primitives/typography';
import { ContentGrid, Section } from '@/components/theme/layout';

export function ElementsShowcasePrimarySections() {
    return (
        <>
            {/* Avatars */}
                <Section title="Avatars" description="User representations with status indicators">
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
                <Section title="Statistics" description="Data metrics and KPIs">
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
                <Section title="Charts" description="Simple data visualizations">
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
        </>
    );
}
