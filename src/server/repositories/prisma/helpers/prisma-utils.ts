import { Prisma, type PrismaClient } from '@prisma/client';
import type { TenantScope } from '@/server/types/tenant';

export type PrismaClientBase = PrismaClient | Prisma.TransactionClient;

/**
 * Generic delegate getter — returns typed delegate for the provided model key (safely).
 */
export function getModelDelegate<K extends keyof PrismaClient>(client: PrismaClientBase, key: K): PrismaClient[K] {
    const c = client as PrismaClient;
    if (!(key in c)) {
        throw new Error(`${String(key)} delegate is not available on the Prisma client.`);
    }
    return c[key];
}

export function runTransaction<R>(client: PrismaClient, handler: (tx: Prisma.TransactionClient) => Promise<R>): Promise<R> {
    if (typeof client.$transaction !== 'function') {
        throw new Error('Prisma client is missing $transaction support.');
    }
    return client.$transaction(handler);
}

export function isJsonObject(value: Prisma.JsonValue | null | undefined): value is Record<string, Prisma.JsonValue> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export type JsonLike = Prisma.InputJsonValue | Prisma.JsonValue | Record<string, Prisma.JsonValue> | Record<string, Prisma.InputJsonValue> | null | undefined;

export function toPrismaInputJson(value: JsonLike): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return Prisma.JsonNull;
    }
    return value as Prisma.InputJsonValue;
}

export function extractRoles(metadata: Prisma.JsonValue | null | undefined): string[] {
    if (!isJsonObject(metadata)) {
        return [];
    }
    const roles = metadata.roles;
    if (Array.isArray(roles) && roles.every((r) => typeof r === 'string')) {
        return roles.map(String);
    }
    return [];
}

export function buildMembershipMetadataJson(scope: TenantScope, roles: string[]): Prisma.InputJsonValue {
    return toPrismaInputJson({
        roles: [...roles],
        dataResidency: scope.dataResidency,
        dataClassification: scope.dataClassification,
        auditSource: scope.auditSource,
        auditBatchId: scope.auditBatchId ?? null,
    }) as Prisma.InputJsonValue;
}
