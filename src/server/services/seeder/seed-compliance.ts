// src/server/services/seeder/seed-compliance.ts
import { faker } from '@faker-js/faker';
import { type Prisma } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getActiveMembers, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedComplianceDataInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();

        // Fetch real employees to link checklists to
        const employees = await prisma.employeeProfile.findMany({
            where: { orgId: org.id },
            take: 10
        });

        if (employees.length === 0) {
            return { success: false, message: 'No employees found. Please seed employees first.' };
        }

        // 1. Checklist Templates
        const template = await prisma.checklistTemplate.create({
            data: {
                orgId: org.id,
                name: 'New Hire Onboarding',
                items: [
                    { id: '1', label: 'Sign Contract', required: true },
                    { id: '2', label: 'IT Setup', required: true },
                    { id: '3', label: 'Discord Invite', required: false }
                ],
                metadata: getSeededMetadata(),
            }
        });

        // 2. Checklist Instances (Assign to random employees)
        for (const emp of employees.slice(0, 5)) {
            await prisma.checklistInstance.create({
                data: {
                    orgId: org.id,
                    employeeId: emp.id,
                    templateId: template.id,
                    items: template.items as Prisma.InputJsonValue,
                    status: 'IN_PROGRESS',
                    metadata: getSeededMetadata(),
                }
            });
        }

        // 3. Compliance Log Items (These link to Membership, need userId)
        // Fetch memberships for log items
        const members = await getActiveMembers(org.id);
        if (members.length > 0) {
            for (let index = 0; index < 10; index++) {
                const member = faker.helpers.arrayElement(members);
                await prisma.complianceLogItem.create({
                    data: {
                        orgId: org.id,
                        userId: member.userId,
                        templateItemId: faker.string.uuid(),
                        status: faker.helpers.arrayElement(['PENDING', 'COMPLETE']),
                        dueDate: faker.date.future(),
                        notes: faker.lorem.sentence(),
                        metadata: getSeededMetadata(),
                    }
                });
            }
        }

        return { success: true, message: 'Seeded Compliance (Checklists, Logs).' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
