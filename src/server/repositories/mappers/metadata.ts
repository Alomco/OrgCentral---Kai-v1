import type { JsonValue } from '@/server/repositories/prisma/helpers/prisma-utils';

export function normalizeMetadata(metadata: JsonValue | null | undefined): JsonValue | undefined {
    return metadata ?? undefined;
}
