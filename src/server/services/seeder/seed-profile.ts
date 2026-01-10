// src/server/services/seeder/seed-profile.ts
import { faker } from '@faker-js/faker';
import { EmploymentStatus, LeaveRequestStatus, PerformanceGoalStatus } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedCurrentUserProfileInternal(userId: string): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const profile = await prisma.employeeProfile.findUnique({ where: { orgId_userId: { orgId: org.id, userId } } });

        // Ensure profile exists
        if (!profile) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) { throw new Error('User not found'); }

            // Create minimal profile
            await prisma.employeeProfile.create({
                data: {
                    orgId: org.id,
                    userId,
                    employeeNumber: `ME-001`,
                    firstName: 'Developer',
                    lastName: 'User',
                    displayName: user.displayName ?? 'Dev User',
                    email: user.email,
                    employmentStatus: EmploymentStatus.ACTIVE,
                    metadata: getSeededMetadata(),
                }
            });
        }

        // Add specific data for this user to make dashboard look good
        const timestamp = new Date();

        // 1. Leave Requests
        const policy = await prisma.leavePolicy.findFirst({ where: { orgId: org.id, name: 'Annual Leave (Default)' } });
        if (policy) {
            await prisma.leaveRequest.create({
                data: {
                    orgId: org.id,
                    userId,
                    policyId: policy.id,
                    status: LeaveRequestStatus.APPROVED,
                    startDate: faker.date.past({ years: 0.5 }),
                    endDate: faker.date.past({ years: 0.5 }), // simplified, just for history
                    hours: 40,
                    reason: 'Summer Holiday',
                    metadata: getSeededMetadata(),
                }
            });
        }

        // 2. Training Completed
        await prisma.trainingRecord.create({
            data: {
                orgId: org.id,
                userId,
                courseName: 'Security Awareness 2026',
                provider: 'Internal',
                startDate: faker.date.past({ years: 0.2 }),
                endDate: faker.date.past({ years: 0.2 }),
                status: 'completed',
                approved: true,
                metadata: getSeededMetadata(),
            }
        });

        // 3. Pending Goal
        // Need a review to attach goal to? Create a 'current' review
        const review = await prisma.performanceReview.create({
            data: {
                orgId: org.id,
                userId,
                reviewerOrgId: org.id,
                reviewerUserId: userId, // Self review for simplicity if no manager
                periodStartDate: new Date(timestamp.getFullYear(), 0, 1),
                periodEndDate: new Date(timestamp.getFullYear(), 11, 31),
                scheduledDate: new Date(timestamp.getFullYear(), 5, 1),
                status: 'in_progress',
                metadata: getSeededMetadata(),
            }
        });

        await prisma.performanceGoal.create({
            data: {
                orgId: org.id,
                reviewId: review.id,
                description: 'Complete the new Data Seeder implementation',
                targetDate: faker.date.future(),
                status: PerformanceGoalStatus.IN_PROGRESS,
            }
        });

        return { success: true, message: 'Enriched current user profile with Leave, Training, and Goals.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
