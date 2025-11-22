import type { PrismaClient } from '@prisma/client';
import type {
    ComplianceTemplateCreateInput,
    ComplianceTemplateUpdateInput,
    IComplianceTemplateRepository,
} from '@/server/repositories/contracts/hr/compliance/compliance-template-repository-contract';
import type { ComplianceTemplate } from '@/server/types/compliance-types';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapComplianceTemplateInputToRecord,
    mapComplianceTemplateRecordToDomain,
} from '@/server/repositories/mappers/hr/compliance/compliance-template-mapper';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { registerOrgCacheTag, invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_COMPLIANCE_TEMPLATES } from '@/server/repositories/cache-scopes';
import { RepositoryAuthorizationError } from '@/server/repositories/security';

type ComplianceTemplateDelegate = {
    create: (args: { data: ComplianceTemplateCreateData }) => Promise<ComplianceTemplateRecord>;
    update: (args: { where: { id: string }; data: ComplianceTemplateUpdateData }) => Promise<ComplianceTemplateRecord>;
    delete: (args: { where: { id: string } }) => Promise<void>;
    findUnique: (args: { where: { id: string } }) => Promise<ComplianceTemplateRecord | null>;
    findMany: (args: { where: { orgId: string } }) => Promise<ComplianceTemplateRecord[]>;
};
type ComplianceTemplateRecord = Awaited<ReturnType<ComplianceTemplateDelegate['create']>>;
type ComplianceTemplateCreateData = Parameters<ComplianceTemplateDelegate['create']>[0]['data'];
type ComplianceTemplateUpdateData = Parameters<ComplianceTemplateDelegate['update']>[0]['data'];
export class PrismaComplianceTemplateRepository
    extends BasePrismaRepository
    implements IComplianceTemplateRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): ComplianceTemplateDelegate {
        return (this.prisma as { complianceTemplate: ComplianceTemplateDelegate }).complianceTemplate;
    }

    private async ensureTemplateOrg(templateId: string, orgId: string): Promise<ComplianceTemplateRecord> {
        const record = await this.delegate().findUnique({ where: { id: templateId } });
        if (!record || (record as { orgId?: string }).orgId !== orgId) {
            throw new RepositoryAuthorizationError('Compliance template not found for this organization.');
        }
        return record;
    }

    async createTemplate(input: ComplianceTemplateCreateInput): Promise<ComplianceTemplate> {
        const data: ComplianceTemplateCreateData = stampCreate(mapComplianceTemplateInputToRecord(input));
        const record = await this.delegate().create({
            data,
        });
        registerOrgCacheTag(input.orgId, CACHE_SCOPE_COMPLIANCE_TEMPLATES);
        return mapComplianceTemplateRecordToDomain(record);
    }

    async updateTemplate(
        orgId: string,
        templateId: string,
        updates: ComplianceTemplateUpdateInput,
    ): Promise<ComplianceTemplate> {
        await this.ensureTemplateOrg(templateId, orgId);
        const data: ComplianceTemplateUpdateData = stampUpdate({
            ...mapComplianceTemplateInputToRecord(updates),
            orgId,
        });
        const record = await this.delegate().update({
            where: { id: templateId },
            data,
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_COMPLIANCE_TEMPLATES);
        return mapComplianceTemplateRecordToDomain(record);
    }

    async deleteTemplate(orgId: string, templateId: string): Promise<void> {
        await this.ensureTemplateOrg(templateId, orgId);
        await this.delegate().delete({ where: { id: templateId } });
        await invalidateOrgCache(orgId, CACHE_SCOPE_COMPLIANCE_TEMPLATES);
    }

    async getTemplate(orgId: string, templateId: string): Promise<ComplianceTemplate | null> {
        const record = await this.delegate().findUnique({ where: { id: templateId } });
        if (!record) {
            return null;
        }
        if ((record as { orgId?: string }).orgId !== orgId) {
            throw new RepositoryAuthorizationError('Compliance template access denied for this organization.');
        }
        registerOrgCacheTag(orgId, CACHE_SCOPE_COMPLIANCE_TEMPLATES);
        return mapComplianceTemplateRecordToDomain(record);
    }

    async listTemplates(orgId: string): Promise<ComplianceTemplate[]> {
        const records = await this.delegate().findMany({ where: { orgId } });
        registerOrgCacheTag(orgId, CACHE_SCOPE_COMPLIANCE_TEMPLATES);
        return records.map(mapComplianceTemplateRecordToDomain);
    }
}
