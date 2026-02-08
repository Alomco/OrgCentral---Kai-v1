'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

import type { AuthSession } from '@/server/lib/auth';
import { hasPermission } from '@/lib/security/permission-check';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { NotificationBell } from '@/components/notifications/notification-bell';
import type { NotificationSummary } from '@/components/notifications/notification-item';
import { UserNav } from './user-nav';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgBranding } from '@/server/types/branding-types';
import styles from './app-header.module.css';

interface AppHeaderProps {
    session: NonNullable<AuthSession>;
    authorization: RepositoryAuthorizationContext;
    branding?: OrgBranding | null;
    notifications: NotificationSummary[];
    unreadCount: number;
}

export function AppHeader({
    session,
    authorization,
    branding,
    notifications,
    unreadCount
}: AppHeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const router = useRouter();

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const rawSearchTerm = formData.get('search');
        if (typeof rawSearchTerm !== 'string') {
            return;
        }

        const searchTerm = rawSearchTerm.trim();
        if (searchTerm.length === 0) {
            return;
        }

        const query = new URLSearchParams({ q: searchTerm });
        const destination = hasPermission(authorization.permissions, 'organization', 'update')
            ? '/org/members'
            : hasPermission(authorization.permissions, 'employeeProfile', 'list')
                ? '/hr/employees'
                : '/dashboard';

        router.push(`${destination}?${query.toString()}`);
        setIsSearchOpen(false);
    };

    return (
        <header className={styles.header} data-ui-surface="container">
            <SidebarTrigger className="lg:hidden" />

            <div className={styles.headerContent}>
                <Link href="/dashboard" className={styles.logo}>
                    <span className={styles.logoText}>
                        {branding?.companyName ?? 'OrgCentral'}
                    </span>
                </Link>
            </div>

            <div className={styles.spacer} />

            <div className={styles.actions}>
                {/* Search */}
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8.5 w-8.5 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            aria-label="Search"
                        >
                            <Search className="h-4.5 w-4.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="end" sideOffset={8}>
                        <form onSubmit={handleSearchSubmit} className="space-y-3">
                            <p className="text-sm font-medium">
                                Search OrgCentral
                            </p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="search"
                                    type="search"
                                    placeholder="Search..."
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Try searching for employees, policies, or documents
                            </p>
                        </form>
                    </PopoverContent>
                </Popover>

                {/* Notifications */}
                <NotificationBell
                    notifications={notifications}
                    unreadCount={unreadCount}
                />

                {/* Theme & Style Switcher */}
                <ThemeSwitcher />

                {/* User Navigation */}
                <UserNav session={session} authorization={authorization} />
            </div>
        </header>
    );
}

