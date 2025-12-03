import { Prisma, type PrismaClient } from '@prisma/client';
import type { IPlatformBrandingRepository } from '@/server/repositories/contracts/platform/branding/platform-branding-repository-contract';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapPlatformBrandingRecordToDomain,
    mapPlatformBrandingUpdateToRecord,
} from '@/server/repositories/mappers/platform/branding/platform-branding-mapper';
import type { PlatformBranding } from '@/server/types/branding-types';
import { stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';

type PlatformSettingsDelegate = PrismaClient['platformSetting'];
type PlatformSettingsUpsertArguments = Prisma.PlatformSettingUpsertArgs;

const SETTINGS_KEY = 'platform-branding';

export class PrismaPlatformBrandingRepository
    extends BasePrismaRepository
    implements IPlatformBrandingRepository {
    private get delegate(): PlatformSettingsDelegate {
        return this.prisma.platformSetting;
    }

    async getBranding(): Promise<PlatformBranding | null> {
        const record = await this.delegate.findUnique({ where: { id: SETTINGS_KEY } });
        const branding = record ? (record as { branding?: PlatformBranding | null }).branding ?? null : null;
        return mapPlatformBrandingRecordToDomain(
            record
                ? {
                    branding,
                    updatedAt: (record as { updatedAt?: Date | string | null }).updatedAt ?? null,
                }
                : null,
        );
    }

    async updateBranding(updates: Partial<PlatformBranding>): Promise<PlatformBranding> {
        const brandingPayload = mapPlatformBrandingUpdateToRecord(updates).branding;
        const brandingJson =
            brandingPayload !== undefined
                ? toPrismaInputJson(brandingPayload as unknown as Prisma.JsonValue) ?? Prisma.JsonNull
                : undefined;
        const args: PlatformSettingsUpsertArguments = {
            where: { id: SETTINGS_KEY },
            create: {
                id: SETTINGS_KEY,
                ...stampUpdate({ branding: brandingJson }),
            },
            update: {
                ...stampUpdate({ branding: brandingJson }),
            },
        };
        const record = await this.delegate.upsert(args);
        const mapped = mapPlatformBrandingRecordToDomain({
            branding: (record as { branding?: PlatformBranding | null }).branding ?? null,
            updatedAt: (record as { updatedAt?: Date | string | null }).updatedAt ?? null,
        });
        if (!mapped) {
            throw new Error('Failed to map platform branding record');
        }
        return mapped;
    }

    async resetBranding(): Promise<void> {
        const clearedBranding = toPrismaInputJson(null);
        await this.delegate.upsert({
            where: { id: SETTINGS_KEY },
            create: { id: SETTINGS_KEY, ...stampUpdate({ branding: clearedBranding }) },
            update: stampUpdate({ branding: clearedBranding }),
        });
    }
}
