import type { PrismaClient } from '@prisma/client';
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
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';

type AppPermissionDelegate = {
    findMany: () => Promise<AppPermissionRecord[]>;
    findUnique: (args: { where: { id: string } }) => Promise<AppPermissionRecord | null>;
    create: (args: { data: AppPermissionCreateData }) => Promise<AppPermissionRecord>;
    update: (args: { where: { id: string }; data: AppPermissionUpdateData }) => Promise<AppPermissionRecord>;
    delete: (args: { where: { id: string } }) => Promise<void>;
};
type AppPermissionRecord = Awaited<ReturnType<AppPermissionDelegate['create']>>;
type AppPermissionCreateData = Parameters<AppPermissionDelegate['create']>[0]['data'];
type AppPermissionUpdateData = Parameters<AppPermissionDelegate['update']>[0]['data'];

export class PrismaAppPermissionRepository
    extends BasePrismaRepository
    implements IAppPermissionRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): AppPermissionDelegate {
        return (this.prisma as { appPermission: AppPermissionDelegate }).appPermission;
    }

    async listPermissions(): Promise<AppPermission[]> {
        const records = await this.delegate().findMany();
        return records.map(mapAppPermissionRecordToDomain);
    }

    async getPermission(permissionId: string): Promise<AppPermission | null> {
        const record = await this.delegate().findUnique({ where: { id: permissionId } });
        return record ? mapAppPermissionRecordToDomain(record) : null;
    }

    async createPermission(input: AppPermissionCreateInput): Promise<AppPermission> {
        const data: AppPermissionCreateData = stampCreate(mapAppPermissionCreateInputToRecord(input));
        const record = await this.delegate().create({
            data,
        });
        return mapAppPermissionRecordToDomain(record);
    }

    async updatePermission(permissionId: string, updates: AppPermissionUpdateInput): Promise<AppPermission> {
        const data: AppPermissionUpdateData = stampUpdate(mapAppPermissionUpdateInputToRecord(updates));
        const record = await this.delegate().update({
            where: { id: permissionId },
            data,
        });
        return mapAppPermissionRecordToDomain(record);
    }

    async deletePermission(permissionId: string): Promise<void> {
        await this.delegate().delete({ where: { id: permissionId } });
    }
}
