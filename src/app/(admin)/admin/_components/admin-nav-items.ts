import type { LucideIcon } from 'lucide-react';
import {
    Briefcase,
    KeyRound,
    LayoutDashboard,
    Users,
    Wrench,
    Building2,
} from 'lucide-react';

import type { OrgPermissionMap } from '@/server/security/access-control';
import { hasPermission } from '@/lib/security/permission-check';

export type AdminNavAudience = 'admin' | 'dev';

export interface AdminNavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    audience: AdminNavAudience;
    description?: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        audience: 'admin',
        description: 'Platform overview & insights',
    },
    {
        href: '/org/profile',
        label: 'Organization',
        icon: Building2,
        audience: 'admin',
        description: 'Profile, branding, compliance',
    },
    {
        href: '/org/members',
        label: 'Members',
        icon: Users,
        audience: 'admin',
        description: 'User access & invitations',
    },
    {
        href: '/org/roles',
        label: 'Roles',
        icon: KeyRound,
        audience: 'admin',
        description: 'Permissions & policies',
    },
    {
        href: '/hr/dashboard',
        label: 'HR',
        icon: Briefcase,
        audience: 'admin',
        description: 'People operations',
    },
    {
        href: '/dev/dashboard',
        label: 'Dev Tools',
        icon: Wrench,
        audience: 'dev',
        description: 'Diagnostics & tooling',
    },
];

function canAccessItem(permissions: OrgPermissionMap, audience: AdminNavAudience): boolean {
    if (audience === 'dev') {
        return hasPermission(permissions, 'organization', 'governance');
    }
    return hasPermission(permissions, 'organization', 'read');
}

export function getAdminNavItems(permissions: OrgPermissionMap): AdminNavItem[] {
    return ADMIN_NAV_ITEMS.filter((item) => canAccessItem(permissions, item.audience));
}