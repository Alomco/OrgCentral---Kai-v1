// src/server/services/seeder/seed-profile.ts
import { faker } from '@faker-js/faker';
import { EmploymentStatus, EmploymentType } from '@/server/types/prisma';
import { buildLeavePolicyServiceDependencies } from '@/server/repositories/providers/hr/leave-policy-service-dependencies';
import { buildPeopleServiceDependencies } from '@/server/repositories/providers/hr/people-service-dependencies';
import { buildPerformanceServiceDependencies } from '@/server/repositories/providers/hr/performance-service-dependencies';
import { buildTrainingServiceDependencies } from '@/server/repositories/providers/hr/training-service-dependencies';
import { buildUserServiceDependencies } from '@/server/repositories/providers/org/user-service-dependencies';
import {
    buildSeederAuthorization,
    getDefaultOrg,
    getSeededMetadata,
    type SeedResult,
    UNKNOWN_ERROR_MESSAGE,
} from './utils';

const DEFAULT_ANNUAL_POLICY = 'Annual Leave (Default)';

export async function seedCurrentUserProfileInternal(userId: string): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const authorization = buildSeederAuthorization(org, userId);
        const tenant = authorization.tenantScope;
        const { userRepository } = buildUserServiceDependencies();
        const { profileRepo } = buildPeopleServiceDependencies();
        const { leavePolicyRepository, leaveRequestRepository } = buildLeavePolicyServiceDependencies();
        const { trainingRepository } = buildTrainingServiceDependencies();
        const { repositoryFactory } = buildPerformanceServiceDependencies();

        let profile = await profileRepo.getEmployeeProfileByUser(org.id, userId);

        // Ensure profile exists
        if (!profile) {
            const user = await userRepository.findById(userId);
            if (!user) { throw new Error('User not found'); }

            await profileRepo.createEmployeeProfile(org.id, {
                orgId: org.id,
                userId,
                employeeNumber: 'ME-001',
                firstName: 'Developer',
                lastName: 'User',
                displayName: user.displayName ?? 'Dev User',
                email: user.email,
                employmentStatus: EmploymentStatus.ACTIVE,
                employmentType: EmploymentType.FULL_TIME,
                healthStatus: 'UNDEFINED',
                dataResidency: org.dataResidency,
                dataClassification: org.dataClassification,
                auditSource: authorization.auditSource,
                metadata: getSeededMetadata(),
            });
            profile = await profileRepo.getEmployeeProfileByUser(org.id, userId);
        }

        if (!profile) {
            throw new Error('Profile creation failed');
        }

        // Add specific data for this user to make dashboard look good
        const timestamp = new Date();

        // 1. Leave Requests
        const policy = await leavePolicyRepository.getLeavePolicyByName(tenant, DEFAULT_ANNUAL_POLICY);
        if (policy) {
            const requestId = faker.string.uuid();
            const startDate = faker.date.past({ years: 0.5 });
            const endDate = faker.date.past({ years: 0.5 });
            await leaveRequestRepository.createLeaveRequest(tenant, {
                id: requestId,
                orgId: org.id,
                employeeId: profile.id,
                userId,
                employeeName: profile.displayName ?? 'Developer User',
                leaveType: policy.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                reason: 'Summer Holiday',
                totalDays: 5,
                isHalfDay: false,
                departmentId: profile.departmentId ?? undefined,
                status: 'submitted',
                createdBy: userId,
                dataResidency: org.dataResidency,
                dataClassification: org.dataClassification,
                auditSource: authorization.auditSource,
                policyId: policy.id,
            });
            await leaveRequestRepository.updateLeaveRequest(tenant, requestId, {
                status: 'approved',
                approvedBy: userId,
                approvedAt: new Date().toISOString(),
            });
        }

        // 2. Training Completed
        await trainingRepository.createTrainingRecord(org.id, {
            orgId: org.id,
            userId,
            courseName: 'Security Awareness 2026',
            provider: 'Internal',
            startDate: faker.date.past({ years: 0.2 }),
            endDate: faker.date.past({ years: 0.2 }),
            status: 'completed',
            approved: true,
            approvedAt: new Date(),
            approvedBy: userId,
            metadata: getSeededMetadata(),
        });

        // 3. Pending Goal
        const performanceRepository = repositoryFactory(authorization);
        const review = await performanceRepository.createReview({
            employeeId: profile.id,
            reviewerUserId: userId,
            periodStartDate: new Date(timestamp.getFullYear(), 0, 1),
            periodEndDate: new Date(timestamp.getFullYear(), 11, 31),
            scheduledDate: new Date(timestamp.getFullYear(), 5, 1),
            status: 'in_progress',
            metadata: getSeededMetadata(),
        });

        await performanceRepository.addGoal(review.id, {
            description: 'Complete the new Data Seeder implementation',
            targetDate: faker.date.future(),
            status: 'IN_PROGRESS',
            rating: faker.number.int({ min: 1, max: 5 }),
            comments: faker.lorem.sentence(),
        });

        return { success: true, message: 'Enriched current user profile with Leave, Training, and Goals.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
