import type { PrismaClient } from '@prisma/client';
import type {
    ChecklistInstanceCreateInput,
    ChecklistInstanceItemsUpdate,
    IChecklistInstanceRepository,
} from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapChecklistInstanceInputToRecord,
    mapChecklistInstanceRecordToDomain,
} from '@/server/repositories/mappers/hr/onboarding/checklist-instance-mapper';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { registerOrgCacheTag, invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_CHECKLIST_INSTANCES } from '@/server/repositories/cache-scopes';
import { RepositoryAuthorizationError } from '@/server/repositories/security';

type ChecklistInstanceDelegate = {
    create: (args: { data: ChecklistInstanceCreateData }) => Promise<ChecklistInstanceRecord>;
    update: (args: { where: { id: string }; data: ChecklistInstanceUpdateData }) => Promise<ChecklistInstanceRecord>;
    findUnique: (args: { where: { id: string } }) => Promise<ChecklistInstanceRecord | null>;
    findFirst: (args: { where: { orgId: string; employeeId: string; status?: string } }) => Promise<ChecklistInstanceRecord | null>;
    findMany: (args: { where: { orgId: string; employeeId?: string } }) => Promise<ChecklistInstanceRecord[]>;
};
type ChecklistInstanceRecord = Awaited<ReturnType<ChecklistInstanceDelegate['create']>>;
type ChecklistInstanceCreateData = Parameters<ChecklistInstanceDelegate['create']>[0]['data'];
type ChecklistInstanceUpdateData = Parameters<ChecklistInstanceDelegate['update']>[0]['data'];
export class PrismaChecklistInstanceRepository
    extends BasePrismaRepository
    implements IChecklistInstanceRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): ChecklistInstanceDelegate {
        return (this.prisma as { checklistInstance: ChecklistInstanceDelegate }).checklistInstance;
    }

    private async ensureInstanceOrg(instanceId: string, orgId: string): Promise<ChecklistInstanceRecord> {
        const record = await this.delegate().findUnique({ where: { id: instanceId } });
        if (!record || (record as { orgId?: string }).orgId !== orgId) {
            throw new RepositoryAuthorizationError('Checklist instance not found for this organization.');
        }
        return record;
    }

    async createInstance(input: ChecklistInstanceCreateInput): Promise<ChecklistInstance> {
        const data: ChecklistInstanceCreateData = {
            ...mapChecklistInstanceInputToRecord(input),
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            updatedAt: new Date(),
        };
        const record = await this.delegate().create({
            data,
        });
        registerOrgCacheTag(input.orgId, CACHE_SCOPE_CHECKLIST_INSTANCES);
        return mapChecklistInstanceRecordToDomain(record);
    }

    async getInstance(orgId: string, instanceId: string): Promise<ChecklistInstance | null> {
        const record = await this.delegate().findUnique({ where: { id: instanceId } });
        if (!record) {
            return null;
        }
        if ((record as { orgId?: string }).orgId !== orgId) {
            throw new RepositoryAuthorizationError('Checklist instance access denied for this organization.');
        }
        return mapChecklistInstanceRecordToDomain(record);
    }

    async getActiveInstanceForEmployee(orgId: string, employeeId: string): Promise<ChecklistInstance | null> {
        const record = await this.delegate().findFirst({
            where: { orgId, employeeId, status: 'IN_PROGRESS' },
        });
        return record ? mapChecklistInstanceRecordToDomain(record) : null;
    }

    async listInstancesForEmployee(orgId: string, employeeId: string): Promise<ChecklistInstance[]> {
        const records = await this.delegate().findMany({ where: { orgId, employeeId } });
        return records.map(mapChecklistInstanceRecordToDomain);
    }

    async updateItems(
        orgId: string,
        instanceId: string,
        updates: ChecklistInstanceItemsUpdate,
    ): Promise<ChecklistInstance> {
        await this.ensureInstanceOrg(instanceId, orgId);
        const data: ChecklistInstanceUpdateData = stampUpdate({
            ...mapChecklistInstanceInputToRecord(updates),
            orgId,
        });
        const record = await this.delegate().update({
            where: { id: instanceId },
            data,
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_CHECKLIST_INSTANCES);
        return mapChecklistInstanceRecordToDomain(record);
    }

    async completeInstance(orgId: string, instanceId: string): Promise<ChecklistInstance> {
        await this.ensureInstanceOrg(instanceId, orgId);
        const record = await this.delegate().update({
            where: { id: instanceId },
            data: stampUpdate({ status: 'COMPLETED', completedAt: new Date(), orgId }),
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_CHECKLIST_INSTANCES);
        return mapChecklistInstanceRecordToDomain(record);
    }

    async cancelInstance(orgId: string, instanceId: string): Promise<void> {
        await this.ensureInstanceOrg(instanceId, orgId);
        await this.delegate().update({
            where: { id: instanceId },
            data: stampUpdate({ status: 'CANCELLED', orgId }),
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_CHECKLIST_INSTANCES);
    }
}
