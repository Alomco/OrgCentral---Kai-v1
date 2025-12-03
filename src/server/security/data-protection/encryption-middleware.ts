import type { Prisma } from '@prisma/client';

type PrismaAction = Prisma.PrismaAction;

interface MiddlewareParams {
    model?: string;
    action: PrismaAction;
    args?: Record<string, unknown>;
}

type PrismaMiddleware = (params: MiddlewareParams, next: (params: MiddlewareParams) => Promise<unknown>) => Promise<unknown>;

type EncryptableValue = Prisma.InputJsonValue | Prisma.JsonValue | null;
type MaybePromise<T> = T | Promise<T>;

export type EncryptValue = (value: EncryptableValue, path: string) => MaybePromise<EncryptableValue>;

export interface EncryptionTarget {
    model: string;
    fields: string[];
}

export interface EncryptionMiddlewareOptions {
    targets: EncryptionTarget[];
    encrypt: EncryptValue;
    writableActions?: readonly PrismaAction[];
    shouldEncrypt?: (params: MiddlewareParams) => boolean;
}

function isWritableAction(
    action: PrismaAction,
    allowed: readonly PrismaAction[],
): boolean {
    return allowed.includes(action);
}

function toFieldMap(targets: EncryptionTarget[]): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    for (const target of targets) {
        const fields = map.get(target.model) ?? new Set<string>();
        map.set(target.model, fields);
        for (const field of target.fields) {
            fields.add(field);
        }
    }
    return map;
}

export function createEncryptionMiddleware(
    options: EncryptionMiddlewareOptions,
): PrismaMiddleware {
    const writableActions: readonly PrismaAction[] = options.writableActions ?? [
        'create',
        'createMany',
        'update',
        'updateMany',
        'upsert',
    ];
    const fieldMap = toFieldMap(options.targets);

    return async (
        params: MiddlewareParams,
        next: (params: MiddlewareParams) => Promise<unknown>,
    ): Promise<unknown> => {
        if (!params.model || !isWritableAction(params.action, writableActions)) {
            return next(params);
        }
        if (options.shouldEncrypt && !options.shouldEncrypt(params)) {
            return next(params);
        }
        const targetFields = fieldMap.get(params.model);
        if (!targetFields?.size) {
            return next(params);
        }
        const data = params.args?.data;
        if (!data || typeof data !== 'object') {
            return next(params);
        }
        const mutated: Record<string, unknown> = { ...(data as Record<string, unknown>) };
        for (const field of targetFields) {
            if (field in mutated) {
                mutated[field] = await options.encrypt(
                    mutated[field] as EncryptableValue,
                    `${params.model}.${field}`,
                );
            }
        }
        return next({
            ...params,
            args: { ...params.args, data: mutated },
        });
    };
}
