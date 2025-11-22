import type { PrismaClient } from '@prisma/client';
import type {
    ComplianceAssignmentInput,
    ComplianceItemUpdateInput,
    IComplianceItemRepository,
} from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapComplianceAssignmentInputToRecord,
    mapComplianceItemUpdateToRecord,
    mapComplianceLogRecordToDomain,
} from '@/server/repositories/mappers/hr/compliance/compliance-item-mapper';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { registerOrgCacheTag, invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_COMPLIANCE_ITEMS } from '@/server/repositories/cache-scopes';
import { RepositoryAuthorizationError } from '@/server/repositories/security';

type ComplianceLogDelegate = {
    create: (args: { data: ComplianceLogCreateData }) => Promise<ComplianceLogRecord>;
    update: (args: { where: { id: string }; data: ComplianceLogUpdateData }) => Promise<ComplianceLogRecord>;
    delete: (args: { where: { id: string } }) => Promise<void>;
    findUnique: (args: { where: { id: string } }) => Promise<ComplianceLogRecord | null>;
    findMany: (args: ComplianceLogFindManyArgs) => Promise<ComplianceLogRecord[]>;
};
type ComplianceLogRecord = Awaited<ReturnType<ComplianceLogDelegate['create']>>;
type ComplianceLogCreateData = Parameters<ComplianceLogDelegate['create']>[0]['data'];
type ComplianceLogUpdateData = Parameters<ComplianceLogDelegate['update']>[0]['data'];
type ComplianceLogFindManyArgs = Parameters<ComplianceLogDelegate['findMany']>[0];
export class PrismaComplianceItemRepository
    extends BasePrismaRepository
    implements IComplianceItemRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): ComplianceLogDelegate {
        return (this.prisma as { complianceLogItem: ComplianceLogDelegate }).complianceLogItem;
    }

    private async ensureItemScope(itemId: string, orgId: string, userId: string): Promise<ComplianceLogRecord> {
        const record = await this.delegate().findUnique({ where: { id: itemId } });
        const { orgId: recordOrgId, userId: recordUserId } = (record ?? {}) as { orgId?: string; userId?: string };
        if (!record || recordOrgId !== orgId || recordUserId !== userId) {
            throw new RepositoryAuthorizationError('Compliance item not found for this user/organization.');
        }
        return record;
    }

    async assignItems(input: ComplianceAssignmentInput): Promise<void> {
        const records = mapComplianceAssignmentInputToRecord(input);
        await Promise.all(
            records.map((data) =>
                this.delegate().create({
                    data: stampCreate(data) as ComplianceLogCreateData,
                }),
            ),
        );
        registerOrgCacheTag(input.orgId, CACHE_SCOPE_COMPLIANCE_ITEMS);
    }

    async getItem(orgId: string, userId: string, itemId: string): Promise<ComplianceLogItem | null> {
        const record = await this.delegate().findUnique({ where: { id: itemId } });
        if (!record) return null;
        const { orgId: recordOrgId, userId: recordUserId } = record as { orgId?: string; userId?: string };
        if (recordOrgId !== orgId || recordUserId !== userId) {
            throw new RepositoryAuthorizationError('Compliance item access denied for this user/organization.');
        }
        return mapComplianceLogRecordToDomain(record);
    }

    async listItemsForUser(orgId: string, userId: string): Promise<ComplianceLogItem[]> {
        const records = await this.delegate().findMany({ where: { orgId, userId } });
        return records.map(mapComplianceLogRecordToDomain);
    }

    async updateItem(
        orgId: string,
        userId: string,
        itemId: string,
        updates: ComplianceItemUpdateInput,
    ): Promise<ComplianceLogItem> {
        await this.ensureItemScope(itemId, orgId, userId);
        const data: ComplianceLogUpdateData = stampUpdate({
            ...mapComplianceItemUpdateToRecord(updates),
            orgId,
            userId,
        });
        const record = await this.delegate().update({
            where: { id: itemId },
            data,
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_COMPLIANCE_ITEMS);
        return mapComplianceLogRecordToDomain(record);
    }

    async deleteItem(orgId: string, userId: string, itemId: string): Promise<void> {
        await this.ensureItemScope(itemId, orgId, userId);
        await this.delegate().delete({ where: { id: itemId } });
        await invalidateOrgCache(orgId, CACHE_SCOPE_COMPLIANCE_ITEMS);
    }

    async findExpiringItems(referenceDate: Date, daysUntilExpiry: number): Promise<ComplianceLogItem[]> {
        const cutoff = new Date(referenceDate);
        cutoff.setDate(cutoff.getDate() + daysUntilExpiry);
        const where: ComplianceLogFindManyArgs['where'] = {
            dueDate: { lte: cutoff },
            status: { in: ['PENDING', 'PENDING_REVIEW'] },
        };
        const records = await this.delegate().findMany({ where });
        // No tag registered here because this is a maintenance query across orgs
        return records.map(mapComplianceLogRecordToDomain);
    }
}
