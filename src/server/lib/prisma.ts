import { PrismaClient } from '@prisma/client';

const globalScope = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
    globalScope.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalScope.prisma = prisma;
}
