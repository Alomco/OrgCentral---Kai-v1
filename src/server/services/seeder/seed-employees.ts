// src/server/services/seeder/seed-employees.ts
import { faker } from '@faker-js/faker';
import { MembershipStatus, EmploymentStatus, EmploymentType, Prisma } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedFakeEmployeesInternal(count = 5): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const role = await prisma.role.findFirst({ where: { orgId: org.id, name: 'employee' } });
        if (!role) { throw new Error('Employee role not found'); }

        const depts = await prisma.department.findMany({ where: { orgId: org.id } });

        let created = 0;
        for (let index = 0; index < count; index++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({ firstName, lastName }).toLowerCase();

            // User & Membership
            const user = await prisma.user.create({
                data: { email, displayName: `${firstName} ${lastName}`, status: MembershipStatus.ACTIVE },
            });

            await prisma.membership.create({
                data: {
                    orgId: org.id,
                    userId: user.id,
                    roleId: role.id,
                    status: MembershipStatus.ACTIVE,
                    metadata: getSeededMetadata(),
                    createdBy: user.id,
                },
            });

            // Employee Profile
            await prisma.employeeProfile.create({
                data: {
                    orgId: org.id,
                    userId: user.id,
                    employeeNumber: `EMP-${faker.string.alphanumeric(6).toUpperCase()}`,
                    firstName,
                    lastName,
                    displayName: `${firstName} ${lastName}`,
                    email, // Use same email for simplicity
                    jobTitle: faker.person.jobTitle(),
                    departmentId: depts.length > 0 ? faker.helpers.arrayElement(depts).id : undefined,
                    employmentStatus: EmploymentStatus.ACTIVE,
                    employmentType: faker.helpers.arrayElement(Object.values(EmploymentType)),
                    startDate: faker.date.past({ years: 2 }),
                    metadata: getSeededMetadata(),
                    // UK Compliance Fake Data
                    niNumber: faker.string.alphanumeric(9).toUpperCase(),
                    salaryAmount: new Prisma.Decimal(faker.number.float({ min: 25000, max: 120000, fractionDigits: 2 })),
                    salaryCurrency: 'GBP',
                },
            });
            created++;
        }

        return { success: true, message: `Created ${String(created)} employees`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
