// src/server/services/seeder/seed-integrations.ts
import { faker } from '@faker-js/faker';
import { buildIntegrationServiceDependencies } from '@/server/repositories/providers/org/integration-service-dependencies';
import { buildSeederAuthorization, getDefaultOrg, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedIntegrationsInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const authorization = buildSeederAuthorization(org);
        const { integrationConfigRepository } = buildIntegrationServiceDependencies();
        const providers = ['slack', 'discord', 'google-workspace', 'zoom'];

        for (const provider of providers) {
            const existing = await integrationConfigRepository.getIntegrationConfigByProvider(authorization, provider);
            if (existing) {
                continue;
            }
            await integrationConfigRepository.createIntegrationConfig(authorization, {
                orgId: org.id,
                provider,
                credentials: { apiKey: faker.string.alphanumeric(32) },
                settings: { syncEnabled: true, webhookUrl: faker.internet.url() },
                active: faker.datatype.boolean(),
            });
        }
        return { success: true, message: 'Seeded Integrations.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
