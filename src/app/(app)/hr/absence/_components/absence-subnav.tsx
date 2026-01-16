'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const ABSENCE_NAV_ITEMS = [
    { href: '/hr/absence', label: 'Overview' },
    { href: '/hr/absence/requests', label: 'Requests' },
] as const;

function isActive(pathname: string | null, href: string): boolean {
    if (!pathname) {
        return false;
    }
    if (pathname === href) {
        return true;
    }
    return pathname.startsWith(`${href}/`);
}

export function AbsenceSubnav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Absence navigation" className="flex flex-wrap gap-2">
            {ABSENCE_NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            active
                                ? 'border-primary/40 bg-primary/10 text-foreground'
                                : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground',
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
