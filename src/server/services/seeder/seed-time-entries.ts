// src/server/services/seeder/seed-time-entries.ts
import { faker } from '@faker-js/faker';
import { TimeEntryStatus, Prisma } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getActiveMembers, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedFakeTimeEntriesInternal(count = 20): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const members = await getActiveMembers(org.id);
        if (!members.length) { return { success: false, message: 'No members.' }; }

        let created = 0;
        for (let index = 0; index < count; index++) {
            const member = faker.helpers.arrayElement(members);
            const date = faker.date.recent({ days: 30 });
            const clockIn = new Date(date);
            clockIn.setHours(9, 0, 0, 0); // 9 AM
            const clockOut = new Date(date);
            clockOut.setHours(17, 0, 0, 0); // 5 PM

            await prisma.timeEntry.create({
                data: {
                    orgId: org.id,
                    userId: member.userId,
                    date,
                    clockIn,
                    clockOut,
                    totalHours: new Prisma.Decimal(8),
                    breakDuration: new Prisma.Decimal(1), // 1 hour break
                    status: TimeEntryStatus.COMPLETED,
                    project: faker.commerce.productName(),
                    tasks: { summary: faker.company.buzzPhrase() } as Prisma.InputJsonValue,
                    metadata: getSeededMetadata(),
                }
            });
            created++;
        }
        return { success: true, message: `Created ${String(created)} time entries`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
