'use client';

import Image from 'next/image';
import Link from 'next/link';

import serverErrorImage from '@/assets/errors/server_error.webp';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    void error;

    return (
        <html>
            <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[hsl(var(--background))] px-6 text-center">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[hsl(var(--destructive)/0.12)] blur-3xl" />
                    <Image
                        src={serverErrorImage}
                        alt="Something went wrong"
                        width={220}
                        height={220}
                        className="relative h-48 w-48 drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                        priority
                    />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">Something went wrong</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Please try again or return to the dashboard.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow hover:opacity-90"
                    >
                        Try again
                    </button>
                    <Link
                        className="rounded-full bg-[hsl(var(--muted))] px-5 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.8)]"
                        href="/"
                    >
                        Go home
                    </Link>
                </div>
            </body>
        </html>
    );
}
