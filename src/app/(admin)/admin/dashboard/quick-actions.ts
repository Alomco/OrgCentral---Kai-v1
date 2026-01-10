import { Briefcase, KeyRound, Settings, Users, Wrench } from 'lucide-react';

export const QUICK_ACTIONS = [
    {
        title: 'Manage Members',
        description: 'Invite users and manage access',
        href: '/org/members',
        icon: Users,
    },
    {
        title: 'Manage Roles',
        description: 'Create and configure roles',
        href: '/org/roles',
        icon: KeyRound,
    },
    {
        title: 'Organization Settings',
        description: 'Configure org preferences',
        href: '/org/settings',
        icon: Settings,
    },
    {
        title: 'HR Dashboard',
        description: 'Employee and leave management',
        href: '/hr/dashboard',
        icon: Briefcase,
    },
    {
        title: 'Dev Tools',
        description: 'Development utilities',
        href: '/dev/dashboard',
        icon: Wrench,
    },
] as const;
