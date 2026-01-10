// src/server/services/seeder/seed-stats.ts
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, SEEDED_METADATA_KEY } from './utils';

export async function getSeededDataStatsInternal() {
    try {
        const org = await getDefaultOrg();
        const whereSeeded = { metadata: { path: [SEEDED_METADATA_KEY], equals: true } };
        const orgWhere = { orgId: org.id, ...whereSeeded };

        const [employees, absences, timeEntries, training, reviews, security, notifications, invoices, policies, checklistInstances, leavePolicies] = await Promise.all([
            prisma.employeeProfile.count({ where: orgWhere }),
            prisma.unplannedAbsence.count({ where: orgWhere }),
            prisma.timeEntry.count({ where: orgWhere }),
            prisma.trainingRecord.count({ where: orgWhere }),
            prisma.performanceReview.count({ where: orgWhere }),
            prisma.securityEvent.count({ where: { orgId: org.id } }),
            prisma.hRNotification.count({ where: orgWhere }),
            prisma.billingInvoice.count({ where: orgWhere }),
            prisma.hRPolicy.count({ where: orgWhere }),
            prisma.checklistInstance.count({ where: orgWhere }),
            prisma.leavePolicy.count({ where: orgWhere }),
        ]);

        return { employees, absences, timeEntries, training, reviews, security, notifications, invoices, policies, checklistInstances, leavePolicies };
    } catch {
        return { employees: 0, absences: 0, timeEntries: 0, training: 0, reviews: 0, security: 0, notifications: 0, invoices: 0, policies: 0, checklistInstances: 0, leavePolicies: 0 };
    }
}
