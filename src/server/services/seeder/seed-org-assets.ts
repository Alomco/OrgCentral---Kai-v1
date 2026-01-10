// src/server/services/seeder/seed-org-assets.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedOrgAssetsInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();

        // 1. Locations
        const locations = ['Headquarters', 'London Branch', 'Remote Hub', 'Innovation Center'];
        for (const name of locations) {
            await prisma.location.create({
                data: {
                    id: faker.string.uuid(),
                    orgId: org.id,
                    name,
                    address: faker.location.streetAddress({ useFullAddress: true }),
                    phone: faker.phone.number(),
                }
            });
        }

        // 2. HR Policies
        const policies = ['Employee Handbook', 'Remote Work Policy', 'Code of Conduct', 'IT Security Policy'];
        for (const title of policies) {
            await prisma.hRPolicy.create({
                data: {
                    orgId: org.id,
                    title,
                    content: faker.lorem.paragraphs(3),
                    version: 'v1.0',
                    effectiveDate: faker.date.past(),
                    status: 'published',
                    metadata: getSeededMetadata(),
                }
            });
        }

        return { success: true, message: 'Seeded Locations and Policies.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
