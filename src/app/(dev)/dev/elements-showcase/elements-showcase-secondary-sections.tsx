import {
    AlertCircle,
    Bell,
    CheckCircle,
    FileText,
    Inbox,
    Settings,
    Users,
} from 'lucide-react';

import {
    ActionCard,
    DataList,
    EmptyState,
    FeatureCard,
    InfoCard,
    KeyValueGrid,
    PremiumAccordion,
    PremiumAccordionItem,
    Timeline,
} from '@/components/theme/elements';
import { Text } from '@/components/theme/primitives/typography';
import { Button } from '@/components/ui/button';
import { ContentGrid, Section } from '@/components/theme/layout';

export function ElementsShowcaseSecondarySections() {
    return (
        <>
            {/* Cards */}
            <Section title="dYź? Cards" description="Feature and info cards">
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
            <Section title="Accordion" description="Expandable content sections">
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
            <Section title="Data Display" description="Lists, grids, and timelines">
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
            <Section title="Empty State">
                <div className="rounded-lg border bg-card">
                    <EmptyState
                        icon={<Inbox className="h-8 w-8" />}
                        title="No items yet"
                        description="Get started by creating your first item"
                        action={<Button>Create Item</Button>}
                    />
                </div>
            </Section>
        </>
    );
}
