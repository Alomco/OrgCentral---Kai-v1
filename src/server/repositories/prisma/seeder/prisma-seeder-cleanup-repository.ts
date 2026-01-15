import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ISeederCleanupRepository } from '@/server/repositories/contracts/seeder/seeder-cleanup-repository-contract';

export class PrismaSeederCleanupRepository
  extends BasePrismaRepository
  implements ISeederCleanupRepository {
  async clearSeededData(orgId: string, metadataKey: string): Promise<void> {
    const whereSeeded = { metadata: { path: [metadataKey], equals: true } };

    await this.prisma.billingInvoice.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.organizationSubscription.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.paymentMethod.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.hRNotification.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.hRPolicy.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.complianceLogItem.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.checklistInstance.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.checklistTemplate.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.leaveRequest.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.unplannedAbsence.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.timeEntry.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.trainingRecord.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.performanceReview.deleteMany({ where: { orgId, ...whereSeeded } });
    await this.prisma.employeeProfile.deleteMany({ where: { orgId, ...whereSeeded } });
  }
}
