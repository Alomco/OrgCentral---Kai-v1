import type { ComplianceItemStatus } from '@/server/types/compliance-types';
import { BasePrismaRepository, type BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { IComplianceStatusRepository, ComplianceStatusSnapshot } from '@/server/repositories/contracts/hr/compliance/compliance-status-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';

type ComplianceStatus = ComplianceItemStatus | 'NOT_APPLICABLE';

export class PrismaComplianceStatusRepository
  extends BasePrismaRepository
  implements IComplianceStatusRepository {
  private readonly profileRepository: IEmployeeProfileRepository;

  constructor(options: BasePrismaRepositoryOptions & { profileRepository?: IEmployeeProfileRepository } = {}) {
    super(options);
    this.profileRepository = options.profileRepository ?? new PrismaEmployeeProfileRepository({ prisma: this.prisma });
  }

  async recalculateForUser(orgId: string, userId: string): Promise<ComplianceStatusSnapshot | null> {
    const items = await this.prisma.complianceLogItem.findMany({ where: { orgId, userId } });
    if (items.length === 0) {
      return null;
    }

    const status = this.calculateStatus(items.map((item) => item.status as ComplianceItemStatus));
    const profile = await this.profileRepository.getEmployeeProfileByUser(orgId, userId);

    if (profile) {
      await this.profileRepository.updateComplianceStatus(orgId, profile.id, status);
    }

    return { status, itemCount: items.length };
  }

  private calculateStatus(statuses: ComplianceItemStatus[]): ComplianceStatus {
    if (statuses.length === 0) {
      return 'NOT_APPLICABLE';
    }
    if (statuses.includes('EXPIRED')) {
      return 'EXPIRED';
    }
    if (statuses.includes('MISSING')) {
      return 'MISSING';
    }
    if (statuses.includes('PENDING_REVIEW')) {
      return 'PENDING_REVIEW';
    }
    if (statuses.includes('PENDING')) {
      return 'PENDING';
    }
    if (statuses.every((s) => s === 'NOT_APPLICABLE')) {
      return 'NOT_APPLICABLE';
    }
    return 'COMPLETE';
  }
}
