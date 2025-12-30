import type { IntegrationConfig } from '@/server/types/hr-types';
import { Prisma, type IntegrationConfig as PrismaIntegrationConfig } from '@prisma/client';

export function mapPrismaIntegrationConfigToDomain(record: PrismaIntegrationConfig): IntegrationConfig {
    return {
        id: record.id,
        orgId: record.orgId,
        provider: record.provider,
        credentials: record.credentials,
        settings: record.settings,
        active: record.active,
        compliance: record.compliance,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainIntegrationConfigToPrisma(input: IntegrationConfig): Prisma.IntegrationConfigUncheckedCreateInput {
    return {
        orgId: input.orgId,
        provider: input.provider,
        credentials: input.credentials as Prisma.InputJsonValue,
        settings: input.settings as Prisma.InputJsonValue,
        active: input.active,
        compliance: input.compliance === null ? Prisma.JsonNull : (input.compliance),
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}
