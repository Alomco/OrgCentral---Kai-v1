import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import type { OrgPermissionMap } from '@/server/security/access-control';

import { AdminNavigationLinks, AdminUserInfo } from './admin-navigation-links';
import { getAdminNavItems } from './admin-nav-items';

export interface AdminNavigationProps {
    organizationId: string;
    organizationLabel: string | null;
    roleKey: string;
    permissions: OrgPermissionMap;
    userEmail: string | null;
}

export function AdminNavigation(props: AdminNavigationProps) {
    const items = getAdminNavItems(props.permissions)
        .map(({ href, label }) => ({ href, label }));

    return (
        <header className="sticky top-0 [z-index:var(--z-sticky)] border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70 shadow-sm">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/dashboard"
                        suppressHydrationWarning
                        className="flex items-center gap-2 font-semibold text-foreground motion-safe:transition-colors hover:text-primary"
                    >
                        <ShieldCheck className="h-5 w-5" />
                        <span className="hidden sm:inline">Admin</span>
                    </Link>
                    <AdminNavigationLinks items={items} />
                </div>
                <AdminUserInfo
                    organizationLabel={props.organizationLabel}
                    userEmail={props.userEmail}
                    roleKey={props.roleKey}
                />
            </div>
        </header>
    );
}
