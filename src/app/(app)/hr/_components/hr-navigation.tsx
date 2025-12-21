import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import type { OrgPermissionMap } from '@/server/security/access-control';
import { hasPermission } from '@/lib/security/permission-check';

const HR_NAVIGATION_ITEMS = [
    { href: '/hr/dashboard', label: 'Dashboard', audience: 'member' },
    { href: '/hr/profile', label: 'My profile', audience: 'member' },
    { href: '/hr/policies', label: 'Policies', audience: 'member' },
    { href: '/hr/leave', label: 'Leave', audience: 'member' },
    { href: '/hr/absences', label: 'Absences', audience: 'member' },
    { href: '/hr/compliance', label: 'Compliance', audience: 'compliance' },
    { href: '/hr/employees', label: 'Employees', audience: 'admin' },
    { href: '/hr/onboarding', label: 'Onboarding', audience: 'admin' },
    { href: '/hr/settings', label: 'Settings', audience: 'admin' },
    { href: '/hr/admin', label: 'Admin', audience: 'admin' },
] as const;

type HrNavigationAudience = (typeof HR_NAVIGATION_ITEMS)[number]['audience'];

function canAccessNavItem(permissions: OrgPermissionMap, audience: HrNavigationAudience): boolean {
    if (audience === 'member') {
        return hasPermission(permissions, 'organization', 'read');
    }
    if (audience === 'compliance') {
        return hasPermission(permissions, 'audit', 'read') || hasPermission(permissions, 'residency', 'enforce');
    }
    return hasPermission(permissions, 'organization', 'update');
}

export function HrNavigation(props: {
    organizationId: string;
    userEmail: string | null;
    roleKey: string;
    permissions: OrgPermissionMap;
}) {
    return (
        <header className="border-b bg-background">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link className="text-base font-semibold" href="/hr/dashboard">
                        HR
                    </Link>
                    <nav className="flex items-center gap-3">
                        {HR_NAVIGATION_ITEMS.filter((item) => canAccessNavItem(props.permissions, item.audience)).map(
                            (item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </nav>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Org {props.organizationId}</Badge>
                    <Badge variant="outline">{props.roleKey}</Badge>
                    {props.userEmail ? <Badge variant="outline">{props.userEmail}</Badge> : null}
                </div>
            </div>
        </header>
    );
}
