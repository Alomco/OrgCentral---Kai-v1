import type { PrismaClient } from '@prisma/client';
import type {
    IPlatformBrandingRepository,
} from '@/server/repositories/contracts/platform/branding/platform-branding-repository-contract';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    mapPlatformBrandingRecordToDomain,
    mapPlatformBrandingUpdateToRecord,
} from '@/server/repositories/mappers/platform/branding/platform-branding-mapper';
import type { PlatformBranding } from '@/server/types/branding-types';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';

type PlatformSettingsDelegate = {
    findUnique: (args: { where: { id: string } }) => Promise<PlatformSettingsRecord | null>;
    upsert: (args: PlatformSettingsUpsertArgs) => Promise<PlatformSettingsRecord>;
};
type PlatformSettingsRecord = Awaited<ReturnType<PlatformSettingsDelegate['upsert']>>;
type PlatformSettingsUpsertArgs = Parameters<PlatformSettingsDelegate['upsert']>[0];

const SETTINGS_KEY = 'platform-branding';

export class PrismaPlatformBrandingRepository
    extends BasePrismaRepository
    implements IPlatformBrandingRepository {
    constructor(prisma?: PrismaClient) {
        super(prisma);
    }

    private delegate(): PlatformSettingsDelegate {
        return getModelDelegate(this.prisma as unknown as Record<string, unknown>, 'platformSetting' as keyof PrismaClient) as unknown as PlatformSettingsDelegate;
    }

    async getBranding(): Promise<PlatformBranding | null> {
        const record = await this.delegate().findUnique({ where: { id: SETTINGS_KEY } });
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
        const args: PlatformSettingsUpsertArgs = {
            where: { id: SETTINGS_KEY },
            create: {
                id: SETTINGS_KEY,
                ...stampUpdate({ branding: mapPlatformBrandingUpdateToRecord(updates).branding }),
            },
            update: {
                ...stampUpdate({ branding: mapPlatformBrandingUpdateToRecord(updates).branding }),
            },
        };
        const record = await this.delegate().upsert(args);
        return mapPlatformBrandingRecordToDomain({
            branding: (record as { branding?: PlatformBranding | null }).branding ?? null,
            updatedAt: (record as { updatedAt?: Date | string | null }).updatedAt ?? null,
        }) as PlatformBranding;
    }

    async resetBranding(): Promise<void> {
        await this.delegate().upsert({
            where: { id: SETTINGS_KEY },
            create: { id: SETTINGS_KEY, ...stampUpdate({ branding: null }) },
            update: stampUpdate({ branding: null }),
        });
    }
}
