/**
 * 🧭 Dev Navigation Components
 *
 * Sidebar and top bar navigation for the Dev Admin section.
 *
 * @module app/(dev)/dev/_components/development-navigation
 */

import Link from 'next/link';
import {
    Terminal,
    LayoutDashboard,
    Palette,
    Database,
    Users,
    Settings,
    Layers,
    Sparkles,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface DevelopmentNavigationProps {
    organizationLabel: string | null;
    userEmail: string | null;
}

interface NavItem {
    href: string;
    label: string;
    icon: typeof Terminal;
    description?: string;
}

// ============================================================================
// Navigation Items
// ============================================================================

const DEV_NAV_ITEMS: NavItem[] = [
    { href: '/dev/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Control center' },
    { href: '/dev/data', label: 'Data Seeder', icon: Database, description: 'Manage mock data' },
    { href: '/dev/elements-showcase', label: 'Elements', icon: Sparkles, description: 'UI components' },
    { href: '/dev/layout-showcase', label: 'Layouts', icon: Layers, description: 'Page layouts' },
    { href: '/dev/premium-showcase', label: 'Premium', icon: Palette, description: 'Premium features' },
];

const QUICK_LINKS: NavItem[] = [
    { href: '/admin/dashboard', label: 'Admin', icon: Settings },
    { href: '/hr/dashboard', label: 'HR', icon: Users },
    { href: '/dashboard', label: 'Employee', icon: LayoutDashboard },
];

// ============================================================================
// Top Bar
// ============================================================================

export function DevelopmentTopBar({ organizationLabel, userEmail }: DevelopmentNavigationProps) {
    return (
        <header className="sticky top-0 z-(--z-sticky) h-14 bg-background/80 backdrop-blur-md">
            <div className="flex h-full items-center justify-between px-6">
                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/dev/dashboard"
                        className="flex items-center gap-2 text-lg font-semibold"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent text-white shadow-md shadow-primary/20">
                            <Terminal className="h-4 w-4" />
                        </div>
                        <span className="bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
                            Dev Tools
                        </span>
                    </Link>
                </div>

                {/* Right: User info */}
                <div className="flex items-center gap-4">
                    {organizationLabel && (
                        <span className="text-xs text-muted-foreground/60">{organizationLabel}</span>
                    )}
                    {userEmail && (
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-medium text-primary">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden text-sm text-muted-foreground md:block">{userEmail}</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

// ============================================================================
// Sidebar
// ============================================================================

export function DevelopmentSidebar() {
    return (
        <aside className="fixed left-0 top-14 z-(--z-sticky) h-[calc(100vh-3.5rem)] w-56 bg-background/60 backdrop-blur-sm">
            <div className="flex h-full flex-col p-4">
                {/* Main Navigation */}
                <nav className="flex-1 space-y-1">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                        Navigation
                    </p>
                    {DEV_NAV_ITEMS.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </nav>

                {/* Quick Links */}
                <div className="border-t border-border/30 pt-4">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                        Quick Links
                    </p>
                    {QUICK_LINKS.map((item) => (
                        <NavLink key={item.href} item={item} compact />
                    ))}
                </div>

                {/* Back to App */}
                <div className="mt-4 pt-4 border-t border-border/30">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Exit Dev Mode
                    </Link>
                </div>
            </div>
        </aside>
    );
}

// ============================================================================
// Nav Link Component
// ============================================================================

function NavLink({ item, compact = false }: { item: NavItem; compact?: boolean }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                compact && 'py-1.5'
            )}
        >
            <Icon className="h-4 w-4 shrink-0 text-primary/60 transition-colors group-hover:text-primary" />
            <div className="min-w-0 flex-1">
                <span className="font-medium">{item.label}</span>
                {item.description && !compact && (
                    <p className="truncate text-xs text-muted-foreground/60">{item.description}</p>
                )}
            </div>
        </Link>
    );
}

// ============================================================================
// Combined Shell
// ============================================================================

export function DevelopmentNavigationShell({ children, organizationLabel, userEmail }: DevelopmentNavigationProps & { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <DevelopmentTopBar organizationLabel={organizationLabel} userEmail={userEmail} />
            <DevelopmentSidebar />
            <main className="ml-56 min-h-[calc(100vh-3.5rem)] p-6">
                {children}
            </main>
        </div>
    );
}
