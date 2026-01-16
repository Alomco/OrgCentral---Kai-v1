import Link from 'next/link';
import {
    Calendar,
    FileText,
    User,
    Users,
    Settings,
    AlertCircle,
    ChevronRight,
    Clock,
    GraduationCap
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { hasPermission } from '@/lib/security/permission-check';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

interface QuickActionsProps {
    authorization: RepositoryAuthorizationContext;
}

export function QuickActions({ authorization }: QuickActionsProps) {
    const isAdmin = hasPermission(authorization.permissions, 'organization', 'update');

    const actions = [
        {
            title: "Request Leave",
            description: "Submit a new leave request",
            icon: Calendar,
            href: "/hr/leave",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            hover: "hover:bg-blue-500/20"
        },
        {
            title: "Report Absence",
            description: "Log unplanned time off",
            icon: AlertCircle,
            href: "/hr/absence",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            hover: "hover:bg-rose-500/20"
        },
        {
            title: "My Profile",
            description: "View and update details",
            icon: User,
            href: "/hr/profile",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            hover: "hover:bg-emerald-500/20"
        },
        {
            title: "Policies",
            description: "Read company policies",
            icon: FileText,
            href: "/hr/policies",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            hover: "hover:bg-amber-500/20"
        }
    ];

    if (isAdmin) {
        actions.push(
            {
                title: "Manage Employees",
                description: "View and edit records",
                icon: Users,
                href: "/hr/employees",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
                hover: "hover:bg-purple-500/20"
            },
            {
                title: "HR Settings",
                description: "Configure system options",
                icon: Settings,
                href: "/hr/settings",
                color: "text-slate-500",
                bg: "bg-slate-500/10",
                hover: "hover:bg-slate-500/20"
            }
        );
    }

    // Add Time Tracking and Training if available (assuming links exist based on search)
    // Checking previous search results, time-tracking and training dirs exist.
    actions.push(
        {
            title: "Time Tracking",
            description: "Log your hours",
            icon: Clock,
            href: "/hr/time-tracking",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            hover: "hover:bg-cyan-500/20"
        },
        {
            title: "Training",
            description: "View your courses",
            icon: GraduationCap,
            href: "/hr/training",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            hover: "hover:bg-indigo-500/20"
        }
    );

    return (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Select a task to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {actions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className={`group relative flex flex-col gap-3 rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-border/50 hover:shadow-md ${action.hover} ${action.bg}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`rounded-lg p-2 bg-background/60 backdrop-blur-sm ${action.color}`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <div>
                                <div className="font-semibold">{action.title}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">{action.description}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function QuickActionsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="space-y-2">
                    <div className="h-5 w-32 bg-muted rounded-md" />
                    <div className="h-4 w-48 bg-muted rounded-md" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-32 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
