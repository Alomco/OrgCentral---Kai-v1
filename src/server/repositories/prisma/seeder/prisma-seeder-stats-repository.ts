import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type {
  ISeederStatsRepository,
  SeederStats,
} from '@/server/repositories/contracts/seeder/seeder-stats-repository-contract';

export class PrismaSeederStatsRepository
  extends BasePrismaRepository
  implements ISeederStatsRepository {
  async getSeededStats(orgId: string, metadataKey: string): Promise<SeederStats> {
    const whereSeeded = { metadata: { path: [metadataKey], equals: true } };
    const orgWhere = { orgId, ...whereSeeded };

    const [
      employees,
      absences,
      timeEntries,
      training,
      reviews,
      security,
      notifications,
      invoices,
      policies,
      checklistInstances,
      leavePolicies,
    ] = await Promise.all([
      this.prisma.employeeProfile.count({ where: orgWhere }),
      this.prisma.unplannedAbsence.count({ where: orgWhere }),
      this.prisma.timeEntry.count({ where: orgWhere }),
      this.prisma.trainingRecord.count({ where: orgWhere }),
      this.prisma.performanceReview.count({ where: orgWhere }),
      this.prisma.securityEvent.count({ where: { orgId } }),
      this.prisma.hRNotification.count({ where: orgWhere }),
      this.prisma.billingInvoice.count({ where: orgWhere }),
      this.prisma.hRPolicy.count({ where: orgWhere }),
      this.prisma.checklistInstance.count({ where: orgWhere }),
      this.prisma.leavePolicy.count({ where: orgWhere }),
    ]);

    return {
      employees,
      absences,
      timeEntries,
      training,
      reviews,
      security,
      notifications,
      invoices,
      policies,
      checklistInstances,
      leavePolicies,
    };
  }
}
