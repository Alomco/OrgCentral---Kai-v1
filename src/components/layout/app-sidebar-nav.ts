import {
    BarChart3,
    CalendarDays,
    FileText,
    LayoutDashboard,
    Settings,
    Shield,
    User,
    Users,
} from "lucide-react"

import type { ElementType } from "react"

export interface NavItem {
    href: string
    label: string
    icon: ElementType
    subItems?: NavItem[]
    isAccordion?: boolean
    badge?: string
}

export const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
        href: "/hr",
        label: "HR Management",
        icon: Users,
        isAccordion: true,
        subItems: [
            { href: "/hr/dashboard", label: "HR Dashboard", icon: LayoutDashboard },
            { href: "/hr/profile", label: "My Profile", icon: User },
            { href: "/hr/leave", label: "Leave Management", icon: CalendarDays },
            { href: "/hr/employees", label: "Employees", icon: Users },
            { href: "/hr/policies", label: "Policies", icon: FileText },
            { href: "/hr/compliance", label: "Compliance", icon: Shield },
            { href: "/hr/performance", label: "Performance", icon: BarChart3 },
        ],
    },
    { href: "/settings", label: "Settings", icon: Settings },
]
