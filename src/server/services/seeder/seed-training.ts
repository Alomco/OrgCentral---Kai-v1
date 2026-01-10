// src/server/services/seeder/seed-training.ts
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getActiveMembers, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedFakeTrainingInternal(count = 10): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const members = await getActiveMembers(org.id);
        if (!members.length) { return { success: false, message: 'No members.' }; }

        let created = 0;
        for (let index = 0; index < count; index++) {
            const member = faker.helpers.arrayElement(members);
            const startDate = faker.date.past({ years: 1 });

            await prisma.trainingRecord.create({
                data: {
                    orgId: org.id,
                    userId: member.userId,
                    courseName: faker.company.catchPhrase(),
                    provider: faker.company.name(),
                    startDate,
                    endDate: faker.date.future({ years: 1, refDate: startDate }),
                    status: faker.helpers.arrayElement(['completed', 'in_progress', 'assigned']),
                    cost: new Prisma.Decimal(faker.number.float({ min: 100, max: 2000, fractionDigits: 2 })),
                    metadata: getSeededMetadata(),
                }
            });
            created++;
        }
        return { success: true, message: `Created ${String(created)} training records`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
