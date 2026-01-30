import '@testing-library/jest-dom/vitest';
/*
 * Test-only runtime setup.
 *
 * The current Prisma client in this repo is configured to use the "client" engine,
 * which requires an adapter/accelerateUrl at construction time.
 *
 * Most unit tests should not touch the DB at all, but they may import repository
 * base classes that import the Prisma singleton.
 *
 * To keep unit tests fast and hermetic, we mock the Prisma singleton module.
 */

import type { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

vi.mock('@/server/lib/prisma', () => {
    const prisma = new Proxy(
        {},
        {
            get() {
                throw new Error(
                    'Prisma client was accessed in a unit test. Mock the repository layer or add an integration test harness instead.'
                );
            },
        }
    ) as PrismaClient;

    return { prisma };
});

vi.mock('@/server/logging/audit-logger', () => ({
    recordAuditEvent: vi.fn(() => undefined),
    setAuditLogRepository: vi.fn(),
}));







vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: vi.fn(),
        push: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
    notFound: vi.fn(),
}));

vi.mock('next/headers', () => ({
    headers: vi.fn(() => new Headers()),
}));