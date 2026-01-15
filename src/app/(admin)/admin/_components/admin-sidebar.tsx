'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { OrgPermissionMap } from '@/server/security/access-control';

import { getAdminNavItems } from './admin-nav-items';

interface AdminSidebarProps {
    organizationLabel: string | null;
    roleKey: string;
    permissions: OrgPermissionMap;
}

function isActive(path: string, href: string): boolean {
    return path === href || (href !== '/' && path.startsWith(`${href}/`));
}

function formatRole(roleKey: string): string {
    return roleKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}

export function AdminSidebar({ organizationLabel, roleKey, permissions }: AdminSidebarProps) {
    const pathname = usePathname();
    const items = getAdminNavItems(permissions);

    return (
        <aside
            className={cn(
                'flex w-64 sm:w-72 shrink-0 flex-col border-r border-border/40 bg-background/80 backdrop-blur',
                'sticky top-14 h-[calc(100vh-3.5rem)]'
            )}
            aria-label="Admin sidebar"
        >
            <div className="px-6 py-5">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 font-semibold text-foreground"
                >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span className="text-sm">Global Admin</span>
                </Link>
                <div className="mt-4 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Organization</p>
                    <p className="mt-1 truncate text-sm font-semibold text-foreground">
                        {organizationLabel ?? 'Organization'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRole(roleKey)}</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 pb-6" aria-label="Admin navigation">
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Workspace
                </p>
                <div className="mt-3 space-y-1">
                    {items.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-primary/10 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]'
                                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-lg',
                                        active ? 'bg-primary/15 text-primary' : 'bg-muted/60 text-muted-foreground'
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                </span>
                                <span className="flex-1">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-border/50 px-6 py-4">
                <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold text-foreground">Security posture</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        All org controls require verified approval.
                    </p>
                </div>
            </div>
        </aside>
    );
}