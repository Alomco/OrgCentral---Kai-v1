import { type RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getNotificationComposerService } from '@/server/services/platform/notifications/notification-composer.provider';
import type { OnboardingReminderPayload } from './onboarding-reminder.types';

export class OnboardingReminderProcessor {
    async process(payload: OnboardingReminderPayload, context: RepositoryAuthorizationContext) {
        const repository = new (await import('@/server/repositories/prisma/hr/onboarding/prisma-checklist-instance-repository')).PrismaChecklistInstanceRepository({
            prisma: undefined, // Will use default
        });
        const employeeRepository = new (await import('@/server/repositories/prisma/hr/people/prisma-employee-profile-repository')).PrismaEmployeeProfileRepository({
            prisma: undefined,
        });
        const notificationComposer = getNotificationComposerService();

        // Find all pending checklists
        const pendingChecklists = await repository.findPendingChecklists(context.orgId);

        let notificationsSent = 0;
        const now = new Date();

        for (const checklist of pendingChecklists) {
            // Heuristic: Reminder if started > 3 days ago and no reminder sent in last 3 days
            // Note: In real app, we check metadata for lastReminder
            const daysSinceStart = (now.getTime() - checklist.startedAt.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceStart < 3) { continue; }

            // Fetch employee to get userId
            const employee = await employeeRepository.getEmployeeProfile(context.orgId, checklist.employeeId);
            if (!employee?.userId) { continue; }

            if (payload.dryRun) { continue; }

            await notificationComposer.composeAndSend({
                authorization: context,
                notification: {
                    userId: employee.userId,
                    title: 'Onboarding Checklist Reminder',
                    body: `Your checklist "${checklist.templateName ?? 'Onboarding'}" is still in progress. Please complete outstanding items.`,
                    topic: 'other', // Fallback topic
                    priority: 'high',
                    actionUrl: `/hr/onboarding/checklists/${checklist.id}`,
                    metadata: { checklistId: checklist.id }
                },
                abac: {
                    action: 'notification.compose',
                    resourceType: 'notification',
                    resourceAttributes: { targetUserId: employee.userId },
                },
            });
            notificationsSent++;
        }

        return {
            processedCount: pendingChecklists.length,
            notificationsSent,
        };
    }
}
