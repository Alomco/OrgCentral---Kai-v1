import type { IntegrationConfig, IntegrationConfigRecord } from '@/server/types/hr-types';
import { toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { Prisma } from '@/server/types/prisma';

type IntegrationConfigCreateInput = Prisma.IntegrationConfigUncheckedCreateInput;
type IntegrationConfigInput = Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt?: Date;
    updatedAt?: Date;
};

export function mapPrismaIntegrationConfigToDomain(record: IntegrationConfigRecord): IntegrationConfig {
    return {
        id: record.id,
        orgId: record.orgId,
        provider: record.provider,
        credentials: record.credentials,
        settings: record.settings,
        active: record.active,
        compliance: record.compliance ?? null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainIntegrationConfigToPrisma(input: IntegrationConfigInput): IntegrationConfigCreateInput {
    const credentials = toJsonNullInput(input.credentials);
    const settings = toJsonNullInput(input.settings);
    const compliance =
        input.compliance === undefined
            ? undefined
            : toJsonNullInput(input.compliance);
    const payload: IntegrationConfigCreateInput = {
        orgId: input.orgId,
        provider: input.provider,
        credentials,
        settings,
        active: input.active,
        compliance,
    };
    if (input.createdAt) {
        payload.createdAt = input.createdAt;
    }
    if (input.updatedAt) {
        payload.updatedAt = input.updatedAt;
    }
    return payload;
}

function toJsonNullInput(
    value: Parameters<typeof toPrismaInputJson>[0],
): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    const resolved = toPrismaInputJson(value);
    if (resolved === undefined || resolved === Prisma.DbNull) {
        return Prisma.JsonNull;
    }
    return resolved as Prisma.InputJsonValue | Prisma.JsonNullValueInput;
}
