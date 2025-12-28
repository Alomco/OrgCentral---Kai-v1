/**
 * 📱 Premium Sidebar Navigation Components
 * 
 * Nav items with gradient active states and premium styling.
 * Server Component.
 * 
 * @module components/theme/layout/sidebar-nav
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './sidebar-nav.module.css';

// ============================================================================
// Types
// ============================================================================

export interface NavItemProps {
    /** Navigation href */
    href: string;
    /** Icon element */
    icon?: ReactNode;
    /** Label text */
    label: string;
    /** Badge count */
    badge?: number;
    /** Active state */
    isActive?: boolean;
    /** Collapsed sidebar state */
    isCollapsed?: boolean;
    /** Additional class */
    className?: string;
}

export interface NavSectionProps {
    /** Section title */
    title: string;
    /** Collapsed state */
    isCollapsed?: boolean;
    /** Additional class */
    className?: string;
}

// ============================================================================
// Nav Item
// ============================================================================

/**
 * Sidebar navigation item with gradient active state.
 */
export function SidebarNavItem({
    href,
    icon,
    label,
    badge,
    isActive = false,
    isCollapsed = false,
    className,
}: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                styles.navItem,
                isActive && styles.navItemActive,
                className,
            )}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon && <span className={styles.navIcon}>{icon}</span>}
            <span className={cn(styles.navLabel, isCollapsed && styles.navLabelCollapsed)}>
                {label}
            </span>
            {badge !== undefined && badge > 0 && !isCollapsed && (
                <span className={styles.navBadge}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

// ============================================================================
// Nav Section
// ============================================================================

/**
 * Section header for grouping nav items.
 */
export function SidebarNavSection({ title, isCollapsed, className }: NavSectionProps) {
    if (isCollapsed) {return null;}

    return (
        <div className={cn(styles.navSection, className)}>
            {title}
        </div>
    );
}

// ============================================================================
// Nav Divider
// ============================================================================

/**
 * Gradient divider between nav sections.
 */
export function SidebarNavDivider({ className }: { className?: string }) {
    return <div className={cn(styles.navDivider, className)} />;
}
