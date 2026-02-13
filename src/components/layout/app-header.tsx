'use client';

import Link from 'next/link';

import type { AuthSession } from '@/server/lib/auth';
import { hasPermission } from '@/lib/security/permission-check';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { NotificationBell } from '@/components/notifications/notification-bell';
import type { NotificationSummary } from '@/components/notifications/notification-item';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgBranding } from '@/server/types/branding-types';
import { AppHeaderSearch } from '@/components/layout/app-header-search';
import { UserNav } from './user-nav';
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
    const canSearchEmployees = hasPermission(authorization.permissions, 'employeeProfile', 'list');

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
                <AppHeaderSearch orgId={authorization.orgId} enabled={canSearchEmployees} />

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

