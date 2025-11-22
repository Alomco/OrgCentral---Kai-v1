import type { PrismaClient } from '@prisma/client';
import type {
    EnterpriseOnboardingInput,
    IEnterpriseAdminRepository,
    ModuleAccessUpdateInput,
} from '@/server/repositories/contracts/org/enterprise/enterprise-admin-repository-contract';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapEnterpriseOnboardingInputToRecord,
    mapManagedOrganizationRecordToDomain,
    mapModuleAccessUpdateToRecord,
} from '@/server/repositories/mappers/org/enterprise/enterprise-admin-mapper';
import type { ManagedOrganizationSummary } from '@/server/types/enterprise-types';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampCreate, stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { RepositoryAuthorizationError } from '@/server/repositories/security';
import { CACHE_SCOPE_ENTERPRISE_MANAGED_ORGS } from '@/server/repositories/cache-scopes';

type ManagedOrgDelegate = {
    create: (args: { data: ManagedOrgCreateData }) => Promise<ManagedOrgRecord>;
    update: (args: { where: { id: string }; data: ManagedOrgUpdateData }) => Promise<ManagedOrgRecord>;
    findMany: (args: { where: { adminUserId: string } }) => Promise<ManagedOrgRecord[]>;
    findUnique: (args: { where: { id: string } }) => Promise<ManagedOrgRecord | null>;
};
type ManagedOrgRecord = Awaited<ReturnType<ManagedOrgDelegate['create']>>;
type ManagedOrgCreateData = Parameters<ManagedOrgDelegate['create']>[0]['data'];
type ManagedOrgUpdateData = Parameters<ManagedOrgDelegate['update']>[0]['data'];

export class PrismaEnterpriseAdminRepository
    extends BasePrismaRepository
    implements IEnterpriseAdminRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): ManagedOrgDelegate {
        return (this.prisma as { managedOrganization: ManagedOrgDelegate }).managedOrganization;
    }

    async onboardOrganization(input: EnterpriseOnboardingInput): Promise<ManagedOrganizationSummary> {
        const data: ManagedOrgCreateData = stampCreate({
            ...mapEnterpriseOnboardingInputToRecord(input),
            adminUserId: input.adminUserId,
        });
        const record = await this.delegate().create({
            data,
        });
        registerOrgCacheTag(data.orgId, CACHE_SCOPE_ENTERPRISE_MANAGED_ORGS);
        return mapManagedOrganizationRecordToDomain(record);
    }

    async listManagedOrganizations(adminUserId: string): Promise<ManagedOrganizationSummary[]> {
        const records = await this.delegate().findMany({ where: { adminUserId } });
        return records.map(mapManagedOrganizationRecordToDomain);
    }

    async getManagedOrganization(
        adminUserId: string,
        orgId: string,
    ): Promise<ManagedOrganizationSummary | null> {
        const record = await this.delegate().findUnique({ where: { id: orgId } });
        if (!record || (record as { adminUserId?: string }).adminUserId !== adminUserId) {
            if (!record) return null;
            throw new RepositoryAuthorizationError('Managed organization access denied for this admin.');
        }
        registerOrgCacheTag(orgId, CACHE_SCOPE_ENTERPRISE_MANAGED_ORGS);
        return mapManagedOrganizationRecordToDomain(record);
    }

    async updateModuleAccess(input: ModuleAccessUpdateInput): Promise<ManagedOrganizationSummary> {
        const data: ManagedOrgUpdateData = stampUpdate({
            ...mapModuleAccessUpdateToRecord(input),
            adminUserId: input.adminUserId,
        });
        const record = await this.delegate().update({
            where: { id: input.orgId },
            data,
        });
        await invalidateOrgCache(input.orgId, CACHE_SCOPE_ENTERPRISE_MANAGED_ORGS);
        return mapManagedOrganizationRecordToDomain(record);
    }
}
