import Image from 'next/image';
import Link from 'next/link';
import notFoundImage from '@/assets/errors/not_found.webp';

export const metadata = {
    title: 'Page not found | OrgCentral',
};

export default function NotFound() {
    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <div className="relative">
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[hsl(var(--primary)/0.12)] blur-3xl" />
                <Image
                    src={notFoundImage}
                    alt="Not found"
                    width={260}
                    height={260}
                    className="relative h-52 w-52 drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                    priority
                />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">Page not found</h1>
                <p className="text-[hsl(var(--muted-foreground))]">
                    The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                <Link
                    className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow hover:opacity-90"
                    href="/"
                >
                    Go home
                </Link>
                <Link
                    className="rounded-full bg-[hsl(var(--muted))] px-5 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.8)]"
                    href="/login"
                >
                    Login
                </Link>
            </div>
        </main>
    );
}
