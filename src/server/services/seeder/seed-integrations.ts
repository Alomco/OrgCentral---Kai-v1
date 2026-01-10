// src/server/services/seeder/seed-integrations.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedIntegrationsInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const providers = ['slack', 'discord', 'google-workspace', 'zoom'];

        for (const provider of providers) {
            await prisma.integrationConfig.upsert({
                where: { orgId_provider: { orgId: org.id, provider } },
                update: {},
                create: {
                    orgId: org.id,
                    provider,
                    credentials: { apiKey: faker.string.alphanumeric(32) },
                    settings: { syncEnabled: true, webhookUrl: faker.internet.url() },
                    active: faker.datatype.boolean(),
                }
            });
        }
        return { success: true, message: 'Seeded Integrations.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
