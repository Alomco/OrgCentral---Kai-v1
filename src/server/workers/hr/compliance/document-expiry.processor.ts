import { type RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getNotificationComposerService } from '@/server/services/platform/notifications/notification-composer.provider';
import type { DocumentExpiryPayload } from './document-expiry.types';
import { differenceInCalendarDays } from 'date-fns';

interface WorkPermitData {
    expiryDate?: string;
    number?: string;
    type?: string;
}

export class DocumentExpiryProcessor {
    async process(payload: DocumentExpiryPayload, context: RepositoryAuthorizationContext) {
        const employeeRepository = new (await import('@/server/repositories/prisma/hr/people/prisma-employee-profile-repository')).PrismaEmployeeProfileRepository({
            prisma: undefined
        });
        const notificationComposer = getNotificationComposerService();

        // Fetch all profiles for org to scan JSON fields
        // In production, we should paginate this or verify performance constraints
        const profiles = await employeeRepository.getEmployeeProfilesByOrganization(context.orgId);

        let notificationsSent = 0;
        const now = new Date();

        for (const profile of profiles) {
            if (!profile.userId) { continue; }

            const workPermit = profile.workPermit as WorkPermitData | undefined;
            if (!workPermit?.expiryDate) { continue; }

            const expiryDate = new Date(workPermit.expiryDate);
            if (isNaN(expiryDate.getTime())) { continue; }

            const daysUntilExpiry = differenceInCalendarDays(expiryDate, now);

            // Check if triggers matched
            if (payload.thresholdDays.includes(daysUntilExpiry)) {
                if (payload.dryRun) { continue; }

                await notificationComposer.composeAndSend({
                    authorization: context,
                    notification: {
                        userId: profile.userId,
                        title: 'Document Expiry Warning',
                        body: `Your Work Permit (${workPermit.type ?? 'Document'}) expires in ${String(daysUntilExpiry)} days (${expiryDate.toDateString()}). Please renew it.`,
                        topic: 'other', // Should correspond to 'document-expiry' if available in enum
                        priority: daysUntilExpiry <= 7 ? 'urgent' : 'high',
                        metadata: {
                            documentType: 'workPermit',
                            daysUntilExpiry,
                            expiryDate: expiryDate.toISOString()
                        }
                    },
                    abac: {
                        action: 'notification.compose',
                        resourceType: 'notification',
                        resourceAttributes: { targetUserId: profile.userId },
                    },
                });
                notificationsSent++;
            }
        }

        return {
            processedCount: profiles.length,
            notificationsSent,
        };
    }
}
