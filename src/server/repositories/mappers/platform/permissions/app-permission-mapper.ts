import type {
    AppPermissionCreateInput,
    AppPermissionUpdateInput,
} from '@/server/repositories/contracts/platform/permissions/app-permission-repository-contract';
import type { AppPermission } from '@/server/types/platform-types';
import type { JsonValue } from '@/server/repositories/prisma/helpers/prisma-utils';
import { normalizeMetadata } from '@/server/repositories/mappers/metadata';

export interface AppPermissionRecord {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    isGlobal: boolean;
    metadata?: JsonValue | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export function mapAppPermissionRecordToDomain(record: AppPermissionRecord): AppPermission {
    return {
        id: record.id,
        name: record.name,
        description: record.description ?? undefined,
        category: record.category,
        isGlobal: record.isGlobal,
        metadata: normalizeMetadata(record.metadata),
        createdAt: record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt),
        updatedAt: record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt),
    };
}

export function mapAppPermissionCreateInputToRecord(
    input: AppPermissionCreateInput,
): Omit<AppPermissionRecord, 'id' | 'createdAt' | 'updatedAt'> {
    return {
        name: input.name,
        description: input.description,
        category: input.category,
        isGlobal: input.isGlobal ?? false,
        metadata: input.metadata,
    };
}

export function mapAppPermissionUpdateInputToRecord(
    input: AppPermissionUpdateInput,
): Partial<AppPermissionRecord> {
    const payload: Partial<AppPermissionRecord> = {};
    if (input.name !== undefined) { payload.name = input.name; }
    if (input.description !== undefined) { payload.description = input.description; }
    if (input.category !== undefined) { payload.category = input.category; }
    if (input.isGlobal !== undefined) { payload.isGlobal = input.isGlobal; }
    if (input.metadata !== undefined) { payload.metadata = input.metadata; }
    return payload;
}
