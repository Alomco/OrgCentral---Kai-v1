'use client';

import { useCallback, type ReactNode } from 'react';
import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

interface IntentPrefetchLinkProps extends LinkProps {
    className?: string;
    children: ReactNode;
}

export function IntentPrefetchLink({ href, className, children, ...props }: IntentPrefetchLinkProps) {
    const router = useRouter();

    const handleIntentPrefetch = useCallback(() => {
        router.prefetch(String(href));
    }, [href, router]);

    return (
        <Link
            href={href}
            className={className}
            prefetch={false}
            onMouseEnter={handleIntentPrefetch}
            onFocus={handleIntentPrefetch}
            {...props}
        >
            {children}
        </Link>
    );
}
