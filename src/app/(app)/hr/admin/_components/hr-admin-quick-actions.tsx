import Link from 'next/link';
import {
    Users,
    UserPlus,
    Settings,
    FileText,
    ShieldCheck,
    Calendar,
    Clock,
    BookOpen,
    ClipboardList,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickAction {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const ADMIN_QUICK_ACTIONS: QuickAction[] = [
    {
        href: '/hr/employees',
        label: 'Employee Directory',
        icon: Users,
        description: 'View and manage all employees',
    },
    {
        href: '/hr/onboarding',
        label: 'Onboarding',
        icon: UserPlus,
        description: 'Manage new hire workflows',
    },
    {
        href: '/hr/leave',
        label: 'Leave Management',
        icon: Calendar,
        description: 'Review leave requests',
    },
    {
        href: '/hr/compliance',
        label: 'Compliance',
        icon: ShieldCheck,
        description: 'Track compliance items',
    },
    {
        href: '/hr/time-tracking',
        label: 'Time Tracking',
        icon: Clock,
        description: 'Timesheets and attendance',
    },
    {
        href: '/hr/training',
        label: 'Training',
        icon: BookOpen,
        description: 'Training programs',
    },
    {
        href: '/hr/policies',
        label: 'Policies',
        icon: FileText,
        description: 'Company policies',
    },
    {
        href: '/hr/performance',
        label: 'Performance',
        icon: ClipboardList,
        description: 'Reviews and goals',
    },
    {
        href: '/hr/settings',
        label: 'HR Settings',
        icon: Settings,
        description: 'Configure HR module',
    },
];

/**
 * Quick actions grid for HR admin dashboard
 */
export function HrAdminQuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Navigate to HR management areas</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {ADMIN_QUICK_ACTIONS.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted hover:shadow-sm"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <action.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">
                                    {action.label}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {action.description}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
