import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import type { IIntegrationConfigRepository } from '@/server/repositories/contracts/org/integrations/integration-config-repository-contract';
import {
  mapPrismaIntegrationConfigToDomain,
  mapDomainIntegrationConfigToPrisma,
} from '@/server/repositories/mappers/org/integrations/integration-config-mapper';
import type { IntegrationConfig } from '@/server/types/hr-types';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { Prisma, PrismaIntegrationConfig } from '@/server/types/prisma';

export interface IntegrationConfigFilters {
  orgId?: string;
  provider?: string;
  active?: boolean;
}

export type IntegrationConfigCreationData = Prisma.IntegrationConfigUncheckedCreateInput;
export type IntegrationConfigUpdateData = Prisma.IntegrationConfigUpdateInput;

export class PrismaIntegrationConfigRepository
  extends OrgScopedPrismaRepository
  implements IIntegrationConfigRepository {

  async findById(id: string): Promise<PrismaIntegrationConfig | null> {
    return getModelDelegate(this.prisma, 'integrationConfig').findUnique({ where: { id } });
  }

  async findByOrgAndProvider(orgId: string, provider: string): Promise<PrismaIntegrationConfig | null> {
    return getModelDelegate(this.prisma, 'integrationConfig').findUnique({ where: { orgId_provider: { orgId, provider } } });
  }

  async findAll(filters?: IntegrationConfigFilters): Promise<PrismaIntegrationConfig[]> {
    const whereClause: Prisma.IntegrationConfigWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.provider) {
      whereClause.provider = filters.provider;
    }

    if (filters?.active !== undefined) {
      whereClause.active = filters.active;
    }

    return getModelDelegate(this.prisma, 'integrationConfig').findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
  }

  async create(data: IntegrationConfigCreationData): Promise<PrismaIntegrationConfig> {
    return getModelDelegate(this.prisma, 'integrationConfig').create({ data });
  }

  async update(id: string, data: IntegrationConfigUpdateData): Promise<PrismaIntegrationConfig> {
    return getModelDelegate(this.prisma, 'integrationConfig').update({ where: { id }, data });
  }

  async delete(id: string): Promise<PrismaIntegrationConfig> {
    return getModelDelegate(this.prisma, 'integrationConfig').delete({ where: { id } });
  }

  // --- Contract-facing methods ---
  async createIntegrationConfig(context: RepositoryAuthorizationContext, config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const prismaData = mapDomainIntegrationConfigToPrisma({ ...config, orgId: context.orgId });
    await this.create(prismaData);
  }

  async updateIntegrationConfig(context: RepositoryAuthorizationContext, configId: string, updates: Partial<Omit<IntegrationConfig, 'id' | 'orgId' | 'createdAt'>>): Promise<void> {
    const existing = await this.findById(configId);
    this.assertTenantRecord(existing, context);
    const prismaUpdates = updates as Prisma.IntegrationConfigUpdateInput;
    await this.update(configId, prismaUpdates);
  }

  async getIntegrationConfig(context: RepositoryAuthorizationContext, configId: string): Promise<IntegrationConfig | null> {
    const rec = await this.findById(configId);
    if (!rec) { return null; }
    this.assertTenantRecord(rec, context);
    return mapPrismaIntegrationConfigToDomain(rec);
  }

  async getIntegrationConfigByProvider(context: RepositoryAuthorizationContext, provider: string): Promise<IntegrationConfig | null> {
    const rec = await this.findByOrgAndProvider(context.orgId, provider);
    if (!rec) { return null; }
    this.assertTenantRecord(rec, context);
    return mapPrismaIntegrationConfigToDomain(rec);
  }

  async getIntegrationsByOrganization(context: RepositoryAuthorizationContext, filters?: { provider?: string; active?: boolean; }): Promise<IntegrationConfig[]> {
    const whereClause: Prisma.IntegrationConfigWhereInput = { orgId: context.orgId };
    if (filters?.provider) { whereClause.provider = filters.provider; }
    if (filters?.active !== undefined) { whereClause.active = filters.active; }
    const records = await getModelDelegate(this.prisma, 'integrationConfig').findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    return records.map(mapPrismaIntegrationConfigToDomain);
  }

  async deleteIntegrationConfig(context: RepositoryAuthorizationContext, configId: string): Promise<void> {
    const existing = await this.findById(configId);
    this.assertTenantRecord(existing, context);
    await this.delete(configId);
  }
}
