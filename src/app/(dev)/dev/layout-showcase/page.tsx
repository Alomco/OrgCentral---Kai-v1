/**
 * 🎨 Layout Components Showcase
 * 
 * Demo page for all premium layout components.
 * Server Component.
 */

import { Bell, Settings, User, Home, FileText, Users, Calendar, Sparkles } from 'lucide-react';

// Layout components
import {
    PageContainer,
    PageHeader,
    Section,
    ContentGrid,
    Topbar,
    TopbarSearch,
    TopbarAction,
    Footer,
    BreadcrumbNav,
    SidebarNavItem,
    SidebarNavSection,
    SidebarNavDivider,
} from '@/components/theme/layout';

// Primitives
import { SlideUp, FadeIn } from '@/components/theme/primitives/motion';
import { Heading, Text } from '@/components/theme/primitives/typography';
import { NeonBorderCard, GradientBorderCard } from '@/components/theme/decorative/borders';
import { ThemeDivider } from '@/components/theme/decorative/effects';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LayoutShowcasePage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Premium Topbar */}
            <Topbar
                centerContent={<TopbarSearch placeholder="Search everything..." shortcut="⌘K" />}
                actions={
                    <>
                        <TopbarAction icon={<Bell className="h-4 w-4" />} label="Notifications" />
                        <TopbarAction icon={<Settings className="h-4 w-4" />} label="Settings" />
                    </>
                }
            />

            <div className="flex flex-1">
                {/* Sidebar Demo */}
                <aside className="w-64 border-r bg-sidebar p-4 hidden lg:block">
                    <SidebarNavSection title="Main" />
                    <nav className="space-y-1">
                        <SidebarNavItem href="#" icon={<Home className="h-4 w-4" />} label="Dashboard" isActive />
                        <SidebarNavItem href="#" icon={<Users className="h-4 w-4" />} label="Employees" badge={5} />
                        <SidebarNavItem href="#" icon={<Calendar className="h-4 w-4" />} label="Time Tracking" />
                        <SidebarNavItem href="#" icon={<FileText className="h-4 w-4" />} label="Documents" />
                    </nav>
                    <SidebarNavDivider />
                    <SidebarNavSection title="Settings" />
                    <nav className="space-y-1">
                        <SidebarNavItem href="#" icon={<Settings className="h-4 w-4" />} label="Preferences" />
                        <SidebarNavItem href="#" icon={<User className="h-4 w-4" />} label="Profile" />
                    </nav>
                </aside>

                {/* Main Content */}
                <PageContainer padding="lg" className="flex-1">
                    <div className="space-y-8">
                        {/* Breadcrumb */}
                        <BreadcrumbNav
                            segments={[
                                { label: 'Dev', href: '/dev' },
                                { label: 'Layout Showcase' },
                            ]}
                        />

                        {/* Page Header */}
                        <SlideUp>
                            <PageHeader
                                title={
                                    <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                        Layout Components
                                    </span>
                                }
                                description="Premium layout primitives for your application"
                                icon={<Sparkles className="h-6 w-6" />}
                                actions={
                                    <Button>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Action
                                    </Button>
                                }
                            />
                        </SlideUp>

                        <ThemeDivider variant="glow" />

                        {/* Section Demo */}
                        <Section
                            title="Content Section"
                            description="Sections help organize page content"
                            actions={<Button variant="outline" size="sm">View All</Button>}
                        >
                            <ContentGrid cols={3}>
                                <FadeIn>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Card 1</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Text color="muted">Standard card in a grid layout.</Text>
                                        </CardContent>
                                    </Card>
                                </FadeIn>
                                <FadeIn delay={1}>
                                    <NeonBorderCard>
                                        <Heading size="h5">Neon Card</Heading>
                                        <Text color="muted" size="sm" className="mt-2">
                                            With pulsing border effect.
                                        </Text>
                                    </NeonBorderCard>
                                </FadeIn>
                                <FadeIn delay={2}>
                                    <GradientBorderCard>
                                        <Heading size="h5">Gradient Card</Heading>
                                        <Text color="muted" size="sm" className="mt-2">
                                            With gradient border accent.
                                        </Text>
                                    </GradientBorderCard>
                                </FadeIn>
                            </ContentGrid>
                        </Section>

                        <Section title="Features" spacing="lg">
                            <ContentGrid cols={2}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>🔝 Topbar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Text color="muted" size="sm">
                                            Glassmorphism header with gradient border, search, and actions.
                                        </Text>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>📱 Sidebar Nav</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Text color="muted" size="sm">
                                            Navigation items with gradient active states and badges.
                                        </Text>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>🧭 Breadcrumb</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Text color="muted" size="sm">
                                            Enhanced breadcrumb with home icon and themed separators.
                                        </Text>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>🦶 Footer</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Text color="muted" size="sm">
                                            Elegant footer with gradient top border and links.
                                        </Text>
                                    </CardContent>
                                </Card>
                            </ContentGrid>
                        </Section>
                    </div>
                </PageContainer>
            </div>

            {/* Premium Footer */}
            <Footer
                links={[
                    { label: 'Privacy', href: '#' },
                    { label: 'Terms', href: '#' },
                    { label: 'Support', href: '#' },
                ]}
            />
        </div>
    );
}
