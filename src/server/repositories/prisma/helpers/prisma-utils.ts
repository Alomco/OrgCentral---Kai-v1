import {
    PrismaTypes,
    type PrismaClientInstance,
    type PrismaInputJsonValue,
    type PrismaJsonObject,
    type PrismaJsonValue,
    type PrismaNullableJsonNullValueInput,
    type PrismaTransaction,
} from '@/server/types/prisma';
import type { TenantScope } from '@/server/types/tenant';

export type PrismaClientBase = PrismaClientInstance | PrismaTransaction;

/**
 * Generic delegate getter — returns typed delegate for the provided model key (safely).
 */
export function getModelDelegate<K extends keyof PrismaClientInstance>(client: PrismaClientBase, key: K): PrismaClientInstance[K] {
    const c = client as PrismaClientInstance;
    if (!(key in c)) {
        throw new Error(`${String(key)} delegate is not available on the Prisma client.`);
    }
    return c[key];
}

export function runTransaction<R>(client: PrismaClientInstance, handler: (tx: PrismaTransaction) => Promise<R>): Promise<R> {
    if (typeof client.$transaction !== 'function') {
        throw new Error('Prisma client is missing $transaction support.');
    }
    return client.$transaction(handler);
}

export function isJsonObject(value: PrismaJsonValue | null | undefined): value is PrismaJsonObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export type JsonLike =
    | PrismaInputJsonValue
    | PrismaJsonValue
    | Record<string, PrismaJsonValue>
    | Record<string, PrismaInputJsonValue>
    | null
    | undefined;
export type JsonValue = PrismaJsonValue;

export function toPrismaInputJson(
    value: JsonLike,
): PrismaInputJsonValue | PrismaNullableJsonNullValueInput | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return PrismaTypes.JsonNull;
    }
    return value as PrismaInputJsonValue;
}

export function buildMembershipMetadataJson(scope: TenantScope): PrismaInputJsonValue | PrismaNullableJsonNullValueInput {
    const payload = toPrismaInputJson({
        dataResidency: scope.dataResidency,
        dataClassification: scope.dataClassification,
        auditSource: scope.auditSource,
        auditBatchId: scope.auditBatchId ?? null,
    });
    return payload ?? PrismaTypes.JsonNull;
}

export function getCustomDelegate<TDelegate>(client: Record<string, TDelegate>, key: string): TDelegate {
    return client[key];
}
