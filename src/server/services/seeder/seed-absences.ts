// src/server/services/seeder/seed-absences.ts
import { faker } from '@faker-js/faker';
import { AbsenceStatus, Prisma } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getActiveMembers, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedFakeAbsencesInternal(count = 10): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const members = await getActiveMembers(org.id);
        if (!members.length) { return { success: false, message: 'No members.' }; }

        const types = await prisma.absenceTypeConfig.findMany({ where: { orgId: org.id } });
        if (!types.length) { return { success: false, message: 'No absence types. Run Starter Seed first.' }; }

        let created = 0;
        for (let index = 0; index < count; index++) {
            const member = faker.helpers.arrayElement(members);
            const type = faker.helpers.arrayElement(types);
            const startDate = faker.date.recent({ days: 90 });
            const endDate = faker.date.soon({ days: 5, refDate: startDate });

            await prisma.unplannedAbsence.create({
                data: {
                    orgId: org.id,
                    userId: member.userId,
                    typeId: type.id,
                    startDate,
                    endDate,
                    hours: new Prisma.Decimal(faker.number.float({ min: 4, max: 40, fractionDigits: 1 })),
                    reason: faker.helpers.maybe(() => faker.lorem.sentence()),
                    status: faker.helpers.arrayElement(Object.values(AbsenceStatus)),
                    metadata: getSeededMetadata(),
                }
            });
            created++;
        }
        return { success: true, message: `Created ${String(created)} absences`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
