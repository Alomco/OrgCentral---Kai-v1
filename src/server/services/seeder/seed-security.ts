// src/server/services/seeder/seed-security.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedSecurityEventsInternal(count = 20): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        let created = 0;

        for (let index = 0; index < count; index++) {
            await prisma.securityEvent.create({
                data: {
                    orgId: org.id,
                    eventType: faker.helpers.arrayElement(['login_success', 'login_failed', 'password_change', 'mfa_enabled']),
                    severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
                    description: faker.internet.userAgent(),
                    ipAddress: faker.internet.ipv4(),
                    createdAt: faker.date.recent({ days: 7 }),
                }
            });
            created++;
        }
        return { success: true, message: `Created ${String(created)} security events`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
