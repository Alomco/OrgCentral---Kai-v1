// src/server/services/seeder/seed-cleanup.ts
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, SEEDED_METADATA_KEY, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function clearSeededDataInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();

        const whereSeeded = { metadata: { path: [SEEDED_METADATA_KEY], equals: true } };

        // Delete in order to respect FKs (roughly)
        await prisma.billingInvoice.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.organizationSubscription.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.paymentMethod.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.hRNotification.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.hRPolicy.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.complianceLogItem.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.checklistInstance.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.checklistTemplate.deleteMany({ where: { orgId: org.id, ...whereSeeded } });

        await prisma.leaveRequest.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.unplannedAbsence.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.timeEntry.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.trainingRecord.deleteMany({ where: { orgId: org.id, ...whereSeeded } });
        await prisma.performanceReview.deleteMany({ where: { orgId: org.id, ...whereSeeded } });

        await prisma.employeeProfile.deleteMany({ where: { orgId: org.id, ...whereSeeded } });

        return { success: true, message: 'Cleared all seeded data.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
