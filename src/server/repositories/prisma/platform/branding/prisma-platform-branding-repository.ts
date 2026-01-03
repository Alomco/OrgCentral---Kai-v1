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
import { platformBrandingSchema } from '@/server/validators/platform/branding-validators';

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
        // Validate partial updates - logic depends on whether we fetch first or merge.
        // For branding updates, usually we merge partials. Zod's partial() helps if checking input directly.
        // But updates input is already Partial<PlatformBranding>. 
        // We really want to validate the *result* to be safe, or validated the input field by field.
        // Assuming mapPlatformBrandingUpdateToRecord handles simple mapping, we validate the mapped payload.

        // mapPlatformBrandingUpdateToRecord(updates).branding;

        // Construct a partial schema for validations if needed, or just rely on the full schema parsing the merged result? 
        // Better: Validate the payload structure if possible.
        // Since brandingPayload is Prisma Input, it's hard to validate directly with our domain schema.
        // Strategy: Cast `brandingPayload` to unknown, then parse with a partial schema of platformBrandingSchema?
        // Actually, `brandingPayload` comes from `updates` which is `Partial<PlatformBranding>`.
        // Let's validate `updates` directly before mapping.

        const validatedUpdates = platformBrandingSchema.partial().parse(updates);
        const mappedPayload = mapPlatformBrandingUpdateToRecord(validatedUpdates).branding;

        const brandingJson =
            mappedPayload !== undefined
                ? toPrismaInputJson(mappedPayload as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull
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
