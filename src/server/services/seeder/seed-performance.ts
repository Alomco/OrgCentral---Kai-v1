// src/server/services/seeder/seed-performance.ts
import { faker } from '@faker-js/faker';
import { PerformanceGoalStatus } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getActiveMembers, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedFakePerformanceInternal(count = 5): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const members = await getActiveMembers(org.id);
        if (members.length < 2) { return { success: false, message: 'Need at least 2 members (reviewer/reviewee).' }; }

        let created = 0;
        for (let index = 0; index < count; index++) {
            const reviewee = faker.helpers.arrayElement(members);
            const reviewer = members.find((member) => member.userId !== reviewee.userId) ?? members[0];

            const review = await prisma.performanceReview.create({
                data: {
                    orgId: org.id,
                    userId: reviewee.userId,
                    reviewerOrgId: org.id,
                    reviewerUserId: reviewer.userId,
                    periodStartDate: faker.date.past({ years: 1 }),
                    periodEndDate: new Date(),
                    scheduledDate: faker.date.recent(),
                    status: 'completed',
                    overallRating: faker.number.int({ min: 1, max: 5 }),
                    strengths: faker.lorem.paragraph(),
                    areasForImprovement: faker.lorem.paragraph(),
                    metadata: getSeededMetadata(),
                }
            });

            // Add goals
            await prisma.performanceGoal.createMany({
                data: Array.from({ length: 3 }).map(() => ({
                    orgId: org.id,
                    reviewId: review.id,
                    description: faker.lorem.sentence(),
                    targetDate: faker.date.future(),
                    status: faker.helpers.arrayElement(Object.values(PerformanceGoalStatus)),
                    rating: faker.number.int({ min: 1, max: 5 }),
                })),
            });

            created++;
        }
        return { success: true, message: `Created ${String(created)} performance reviews`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
