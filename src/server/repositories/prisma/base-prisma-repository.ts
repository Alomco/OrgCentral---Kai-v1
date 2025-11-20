import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';

/**
 * Abstract base class for all Prisma-backed repositories.
 * Enforces constructor dependency injection per SOLID principles.
 * No default PrismaClient; each concrete repository must inject its dependencies.
 */
export abstract class BasePrismaRepository {
    protected readonly prisma: PrismaClient;

    protected constructor(prisma: PrismaClient = defaultPrismaClient) {
        this.prisma = prisma;
    }
}
