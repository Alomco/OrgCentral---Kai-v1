import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import { RepositoryAuthorizationError } from '@/server/repositories/security/repository-errors';

export interface BasePrismaRepositoryOptions {
    prisma?: PrismaClient;
    /**
     * Optional hook invoked after a repository write to support cache invalidation or telemetry.
     */
    onAfterWrite?: (orgId: string, scopes?: string[]) => Promise<void> | void;
    /**
     * Optional tracer hook to wrap repository operations.
     */
    trace?: (operation: string, metadata?: Record<string, unknown>) => Promise<void> | void;
}

/**
 * Abstract base class for all Prisma-backed repositories.
 * Enforces constructor dependency injection per SOLID principles.
 * Supports optional cache invalidation and tracing hooks.
 */
export abstract class BasePrismaRepository {
    protected readonly prisma: PrismaClient;
    private readonly onAfterWrite?: BasePrismaRepositoryOptions['onAfterWrite'];
    private readonly traceHook?: BasePrismaRepositoryOptions['trace'];

    constructor(options: BasePrismaRepositoryOptions | PrismaClient = {}) {
        if ('$connect' in (options as PrismaClient)) {
            this.prisma = options as PrismaClient;
            this.onAfterWrite = undefined;
            this.traceHook = undefined;
            return;
        }

        const options_ = options as BasePrismaRepositoryOptions;
        this.prisma = options_.prisma ?? defaultPrismaClient;
        this.onAfterWrite = options_.onAfterWrite;
        this.traceHook = options_.trace;
    }

    protected async runWithTracing<TResult>(
        operation: string,
        handler: () => Promise<TResult>,
        metadata?: Record<string, unknown>,
    ): Promise<TResult> {
        if (!this.traceHook) {
            return handler();
        }
        await this.traceHook(operation, metadata);
        return handler();
    }

    protected async invalidateAfterWrite(orgId: string, scopes: string[]): Promise<void> {
        if (!this.onAfterWrite) {
            return;
        }
        await this.onAfterWrite(orgId, scopes);
    }

    /**
     * Basic tenant-guard helper to prevent cross-org access in repositories.
     */
    protected assertTenantRecord<TRecord extends { orgId?: string | null }>(
        record: TRecord | null | undefined,
        orgId: string,
    ): TRecord {
        if (!record) {
            throw new RepositoryAuthorizationError('Record not found.');
        }
        if (record.orgId !== orgId) {
            throw new RepositoryAuthorizationError('Cross-tenant access detected.');
        }
        return record;
    }
}
