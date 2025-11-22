import type { JsonValue } from '@/server/repositories/prisma/helpers/prisma-utils';

export function normalizeMetadata<T extends JsonValue | null | undefined>(metadata: T): JsonValue | undefined {
    return metadata ?? undefined;
}
