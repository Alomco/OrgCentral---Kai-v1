import { Prisma, type PrismaClient } from '@prisma/client';
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

type AppPermissionCreateData = Prisma.AppPermissionUncheckedCreateInput;
type AppPermissionUpdateData = Prisma.AppPermissionUncheckedUpdateInput;

export class PrismaAppPermissionRepository
    extends BasePrismaRepository
    implements IAppPermissionRepository {
    private get appPermissions(): PrismaClient['appPermission'] {
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
        const mapped = mapAppPermissionCreateInputToRecord(input);
        const data: AppPermissionCreateData = stampCreate({
            ...mapped,
            metadata: toPrismaInputJson(mapped.metadata as unknown as Prisma.JsonValue) ?? Prisma.JsonNull,
        });
        const record = await this.appPermissions.create({
            data,
        });
        return mapAppPermissionRecordToDomain(record);
    }

    async updatePermission(permissionId: string, updates: AppPermissionUpdateInput): Promise<AppPermission> {
        const mapped = mapAppPermissionUpdateInputToRecord(updates);
        const data: AppPermissionUpdateData = stampUpdate({
            ...mapped,
            metadata: mapped.metadata !== undefined
                ? toPrismaInputJson(mapped.metadata as unknown as Prisma.JsonValue) ?? Prisma.JsonNull
                : undefined,
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
