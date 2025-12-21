import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalScope = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma =
    globalScope.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalScope.prisma = prisma;
}
