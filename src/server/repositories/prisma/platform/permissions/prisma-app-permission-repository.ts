import type {
    AppPermissionCreateInput,
    AppPermissionUpdateInput,
    IAppPermissionRepository,
} from '@/server/repositories/contracts/platform/permissions/app-permission-repository-contract';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapAppPermissionCreateInputToRecord,
    mapAppPermissionRecordToDomain,
    mapAppPermissionUpdateInputToRecord,
} from '@/server/repositories/mappers/platform/permissions/app-permission-mapper';
import type { AppPermission } from '@/server/types/platform-types';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { createAppPermissionSchema, updateAppPermissionSchema } from '@/server/validators/platform/permission-validators';
import { Prisma } from '@/server/types/prisma';
import type { PrismaClientInstance } from '@/server/types/prisma';

type AppPermissionCreateData = Prisma.AppPermissionUncheckedCreateInput;
type AppPermissionUpdateData = Prisma.AppPermissionUncheckedUpdateInput;

export class PrismaAppPermissionRepository
    extends BasePrismaRepository
    implements IAppPermissionRepository {
    private get appPermissions(): PrismaClientInstance['appPermission'] {
        return this.prisma.appPermission;
    }

    async listPermissions(): Promise<AppPermission[]> {
        const records = await this.appPermissions.findMany();
        return records.map(mapAppPermissionRecordToDomain);
    }

    async getPermission(permissionId: string): Promise<AppPermission | null> {
        const record = await this.appPermissions.findUnique({ where: { id: permissionId } });
        return record ? mapAppPermissionRecordToDomain(record) : null;
    }

    async createPermission(input: AppPermissionCreateInput): Promise<AppPermission> {
        // Validate input against schema
        const validated = createAppPermissionSchema.parse(input);

        const mapped = mapAppPermissionCreateInputToRecord(validated);

        // Use explicit cast safely after Zod validation
        const metadataJson = toPrismaInputJson(mapped.metadata) ?? Prisma.JsonNull;

        const data: AppPermissionCreateData = stampCreate({
            ...mapped,
            metadata: metadataJson,
        });

        const record = await this.appPermissions.create({
            data,
        });
        return mapAppPermissionRecordToDomain(record);
    }

    async updatePermission(permissionId: string, updates: AppPermissionUpdateInput): Promise<AppPermission> {
        // Validate updates against schema
        const validated = updateAppPermissionSchema.parse(updates);

        const mapped = mapAppPermissionUpdateInputToRecord(validated);

        const metadataJson = mapped.metadata !== undefined
            ? toPrismaInputJson(mapped.metadata) ?? Prisma.JsonNull
            : undefined;

        const data: AppPermissionUpdateData = stampUpdate({
            ...mapped,
            metadata: metadataJson,
        });

        const record = await this.appPermissions.update({
            where: { id: permissionId },
            data,
        });
        return mapAppPermissionRecordToDomain(record);
    }

    async deletePermission(permissionId: string): Promise<void> {
        await this.appPermissions.delete({ where: { id: permissionId } });
    }
}
