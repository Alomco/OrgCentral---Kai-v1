/**
 * 🧭 Premium Breadcrumb Wrapper
 * 
 * Enhanced breadcrumb with gradient separator and home icon.
 * Server Component.
 * 
 * @module components/theme/layout/breadcrumb-nav
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbSegment {
    label: string;
    href?: string;
    icon?: ReactNode;
}

export interface BreadcrumbNavProps {
    /** Breadcrumb segments */
    segments: BreadcrumbSegment[];
    /** Show home icon at start */
    showHome?: boolean;
    /** Home href */
    homeHref?: string;
    /** Additional class */
    className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Premium breadcrumb navigation with gradient styling.
 */
export function BreadcrumbNav({
    segments,
    showHome = true,
    homeHref = '/dashboard',
    className,
}: BreadcrumbNavProps) {
    if (segments.length === 0 && !showHome) {return null;}

    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                {/* Home */}
                {showHome && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link
                                    href={homeHref}
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Home className="h-3.5 w-3.5" />
                                    <span className="sr-only">Home</span>
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {segments.length > 0 && (
                            <BreadcrumbSeparator>
                                <ChevronRight className="h-3.5 w-3.5 text-primary/50" />
                            </BreadcrumbSeparator>
                        )}
                    </>
                )}

                {/* Segments */}
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;

                    return (
                        <BreadcrumbItem key={segment.label}>
                            {isLast ? (
                                <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                                    {segment.icon}
                                    {segment.label}
                                </BreadcrumbPage>
                            ) : (
                                <>
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href={segment.href ?? '#'}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            {segment.icon}
                                            {segment.label}
                                        </Link>
                                    </BreadcrumbLink>
                                    <BreadcrumbSeparator>
                                        <ChevronRight className="h-3.5 w-3.5 text-primary/50" />
                                    </BreadcrumbSeparator>
                                </>
                            )}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

// ============================================================================
// Simple Page Breadcrumb
// ============================================================================

export interface PageBreadcrumbProps {
    /** Current page title */
    pageTitle: string;
    /** Parent section */
    parentTitle?: string;
    /** Parent href */
    parentHref?: string;
    /** Additional class */
    className?: string;
}

/**
 * Simple two-level breadcrumb for pages.
 */
export function PageBreadcrumb({
    pageTitle,
    parentTitle,
    parentHref,
    className,
}: PageBreadcrumbProps) {
    const segments: BreadcrumbSegment[] = [];

    if (parentTitle && parentHref) {
        segments.push({ label: parentTitle, href: parentHref });
    }

    segments.push({ label: pageTitle });

    return <BreadcrumbNav segments={segments} className={className} />;
}
