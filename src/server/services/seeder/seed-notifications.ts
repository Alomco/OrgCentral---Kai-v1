// src/server/services/seeder/seed-notifications.ts
import { faker } from '@faker-js/faker';
import { HRNotificationType, NotificationPriority } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getActiveMembers, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedFakeNotificationsInternal(count = 10): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const members = await getActiveMembers(org.id);
        if (!members.length) { return { success: false, message: 'No members.' }; }

        let created = 0;
        for (let index = 0; index < count; index++) {
            const member = faker.helpers.arrayElement(members);
            await prisma.hRNotification.create({
                data: {
                    orgId: org.id,
                    userId: member.userId,
                    title: faker.lorem.sentence({ min: 3, max: 6 }),
                    message: faker.lorem.paragraph(),
                    type: faker.helpers.arrayElement(Object.values(HRNotificationType)),
                    priority: faker.helpers.arrayElement(Object.values(NotificationPriority)),
                    metadata: getSeededMetadata(),
                }
            });
            created++;
        }
        return { success: true, message: `Created ${String(created)} notifications`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
