import type { IEnterpriseSettingsRepository } from '@/server/repositories/contracts/platform/settings/enterprise-settings-repository-contract';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { EnterpriseSettings } from '@/server/types/platform-types';
import { stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { enterpriseSettingsSchema, enterpriseSettingsUpdateSchema } from '@/server/validators/platform/settings-validators';
import { Prisma } from '@/server/types/prisma';
import type { PrismaClientInstance, PrismaJsonValue } from '@/server/types/prisma';

type PlatformSettingsDelegate = PrismaClientInstance['platformSetting'];
type PlatformSettingsUpsertArguments = Prisma.PlatformSettingUpsertArgs;

const SETTINGS_KEY = 'enterprise-general';

const DEFAULT_SETTINGS: EnterpriseSettings = {
    allowSignups: true,
    maintenanceMode: false,
    defaultTrialDays: 14,
    supportEmail: 'support@example.com',
};

export class PrismaEnterpriseSettingsRepository
    extends BasePrismaRepository
    implements IEnterpriseSettingsRepository {

    private get delegate(): PlatformSettingsDelegate {
        return this.prisma.platformSetting;
    }

    async getSettings(): Promise<EnterpriseSettings> {
        const record = await this.delegate.findUnique({ where: { id: SETTINGS_KEY } });

        if (!record?.metadata) {
            return DEFAULT_SETTINGS;
        }

        // Validate metadata using Zod schema partial because stored data might be incomplete
        // relative to current schema or we just want to override defaults.
        const stored = enterpriseSettingsUpdateSchema.safeParse(record.metadata);

        if (!stored.success) {
            // Log error in real app
            return DEFAULT_SETTINGS;
        }

        return {
            ...DEFAULT_SETTINGS,
            ...stored.data,
        };
    }

    async updateSettings(updates: Partial<EnterpriseSettings>): Promise<EnterpriseSettings> {
        const current = await this.getSettings();
        const merged = { ...current, ...updates };

        // Ensure the final state is valid according to our schema
        const validated = enterpriseSettingsSchema.parse(merged);

        const metadata: Record<string, PrismaJsonValue> = {
            allowSignups: validated.allowSignups,
            maintenanceMode: validated.maintenanceMode,
            defaultTrialDays: validated.defaultTrialDays,
            supportEmail: validated.supportEmail,
            ...(validated.termsUrl !== undefined ? { termsUrl: validated.termsUrl } : {}),
            ...(validated.privacyUrl !== undefined ? { privacyUrl: validated.privacyUrl } : {}),
        };
        const metadataJson = toPrismaInputJson(metadata) ?? Prisma.JsonNull;

        const args: PlatformSettingsUpsertArguments = {
            where: { id: SETTINGS_KEY },
            create: {
                id: SETTINGS_KEY,
                ...stampUpdate({ metadata: metadataJson }),
            },
            update: {
                ...stampUpdate({ metadata: metadataJson }),
            },
        };

        await this.delegate.upsert(args);

        return merged;
    }
}
