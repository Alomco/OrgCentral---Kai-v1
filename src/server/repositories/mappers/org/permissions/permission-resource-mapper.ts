import type { PermissionResource, PermissionResourceRecord } from '@/server/types/security-types';

export function mapPrismaPermissionResourceToDomain(record: PermissionResourceRecord): PermissionResource {
    return {
        id: record.id,
        orgId: record.orgId,
        resource: record.resource,
        actions: record.actions,
        description: record.description,
        metadata: record.metadata,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
