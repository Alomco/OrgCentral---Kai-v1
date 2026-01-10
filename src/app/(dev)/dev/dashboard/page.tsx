import type { Metadata } from 'next';
import Link from 'next/link';

import { ThemeTogglePanel } from '../_components/theme-toggle-panel';
import { GlobalAdminPanel } from '../_components/global-admin-panel';
import { DataSeederPanel } from '../_components/data-seeder-panel';

export const metadata: Metadata = {
    title: 'Dev Admin Dashboard - OrgCentral',
    description: 'Development-only controls for platform diagnostics and tooling.',
};

export default function DevelopmentDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Hero header with gradient text */}
            <header className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-primary/60">
                    Dev admin
                </p>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Development control center
                </h1>
                <p className="text-sm text-muted-foreground/80 max-w-lg">
                    Tools, diagnostics, and feature switches for the local environment.
                </p>
            </header>

            {/* Main Tool Panels - varied column layout */}
            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <ThemeTogglePanel />
                <GlobalAdminPanel />
                <DataSeederPanel />
            </section>

            {/* Navigation section - glass card style */}
            <section className="rounded-xl p-5" data-ui-surface="container">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium">Back to the employee UI</p>
                        <p className="text-xs text-muted-foreground/70">Return to the standard workspace layout.</p>
                    </div>
                    <nav className="flex flex-wrap gap-2">
                        <NavLink href="/dashboard" variant="default">Employee</NavLink>
                        <NavLink href="/org/profile" variant="default">Organization</NavLink>
                        <NavLink href="/hr/dashboard" variant="primary">HR Dashboard</NavLink>
                        <NavLink href="/hr/employees" variant="default">Employees</NavLink>
                        <NavLink href="/admin/dashboard" variant="accent">Admin</NavLink>
                    </nav>
                </div>
            </section>
        </div>
    );
}

type NavLinkVariant = 'default' | 'primary' | 'accent';

function NavLink({ href, children, variant = 'default' }: { href: string; children: React.ReactNode; variant?: NavLinkVariant }) {
    const variantStyles: Record<NavLinkVariant, string> = {
        default: 'bg-muted/40 text-foreground/80 hover:bg-muted/70 hover:text-foreground',
        primary: 'bg-primary/10 text-primary hover:bg-primary/20 shadow-sm shadow-primary/10',
        accent: 'bg-accent/10 text-accent-foreground hover:bg-accent/20 shadow-sm shadow-accent/10',
    };

    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${variantStyles[variant]}`}
        >
            {children}
        </Link>
    );
}
