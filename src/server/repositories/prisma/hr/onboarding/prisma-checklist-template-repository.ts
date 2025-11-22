import type { PrismaClient } from '@prisma/client';
import type {
    ChecklistTemplateCreateInput,
    ChecklistTemplateUpdateInput,
    IChecklistTemplateRepository,
} from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapChecklistTemplateInputToRecord,
    mapChecklistTemplateRecordToDomain,
} from '@/server/repositories/mappers/hr/onboarding/checklist-template-mapper';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { registerOrgCacheTag, invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_CHECKLIST_TEMPLATES } from '@/server/repositories/cache-scopes';
import { RepositoryAuthorizationError } from '@/server/repositories/security';

type ChecklistTemplateDelegate = {
    create: (args: { data: ChecklistTemplateCreateData }) => Promise<ChecklistTemplateRecord>;
    update: (args: { where: { id: string }; data: ChecklistTemplateUpdateData }) => Promise<ChecklistTemplateRecord>;
    delete: (args: { where: { id: string } }) => Promise<void>;
    findUnique: (args: { where: { id: string } }) => Promise<ChecklistTemplateRecord | null>;
    findMany: (args: { where: { orgId: string } }) => Promise<ChecklistTemplateRecord[]>;
};
type ChecklistTemplateRecord = Awaited<ReturnType<ChecklistTemplateDelegate['create']>>;
type ChecklistTemplateCreateData = Parameters<ChecklistTemplateDelegate['create']>[0]['data'];
type ChecklistTemplateUpdateData = Parameters<ChecklistTemplateDelegate['update']>[0]['data'];
export class PrismaChecklistTemplateRepository
    extends BasePrismaRepository
    implements IChecklistTemplateRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): ChecklistTemplateDelegate {
        return (this.prisma as { checklistTemplate: ChecklistTemplateDelegate }).checklistTemplate;
    }

    private async ensureTemplateOrg(templateId: string, orgId: string): Promise<ChecklistTemplateRecord> {
        const record = await this.delegate().findUnique({ where: { id: templateId } });
        if (!record || (record as { orgId?: string }).orgId !== orgId) {
            throw new RepositoryAuthorizationError('Checklist template not found for this organization.');
        }
        return record;
    }

    async createTemplate(input: ChecklistTemplateCreateInput): Promise<ChecklistTemplate> {
        const data: ChecklistTemplateCreateData = stampCreate(mapChecklistTemplateInputToRecord(input));
        const record = await this.delegate().create({
            data,
        });
        registerOrgCacheTag(input.orgId, CACHE_SCOPE_CHECKLIST_TEMPLATES);
        return mapChecklistTemplateRecordToDomain(record);
    }

    async updateTemplate(
        orgId: string,
        templateId: string,
        updates: ChecklistTemplateUpdateInput,
    ): Promise<ChecklistTemplate> {
        await this.ensureTemplateOrg(templateId, orgId);
        const data: ChecklistTemplateUpdateData = stampUpdate({
            ...mapChecklistTemplateInputToRecord(updates),
            orgId,
        });
        const record = await this.delegate().update({
            where: { id: templateId },
            data,
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_CHECKLIST_TEMPLATES);
        return mapChecklistTemplateRecordToDomain(record);
    }

    async deleteTemplate(orgId: string, templateId: string): Promise<void> {
        await this.ensureTemplateOrg(templateId, orgId);
        await this.delegate().delete({ where: { id: templateId } });
        await invalidateOrgCache(orgId, CACHE_SCOPE_CHECKLIST_TEMPLATES);
    }

    async getTemplate(orgId: string, templateId: string): Promise<ChecklistTemplate | null> {
        const record = await this.delegate().findUnique({ where: { id: templateId } });
        if (!record) {
            return null;
        }
        if ((record as { orgId?: string }).orgId !== orgId) {
            throw new RepositoryAuthorizationError('Checklist template access denied for this organization.');
        }
        registerOrgCacheTag(orgId, CACHE_SCOPE_CHECKLIST_TEMPLATES);
        return mapChecklistTemplateRecordToDomain(record);
    }

    async listTemplates(orgId: string): Promise<ChecklistTemplate[]> {
        const records = await this.delegate().findMany({ where: { orgId } });
        registerOrgCacheTag(orgId, CACHE_SCOPE_CHECKLIST_TEMPLATES);
        return records.map(mapChecklistTemplateRecordToDomain);
    }
}
