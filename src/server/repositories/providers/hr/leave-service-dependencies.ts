import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaLeaveBalanceRepository, PrismaLeavePolicyRepository, PrismaLeaveRequestRepository, PrismaLeaveAttachmentRepository } from '@/server/repositories/prisma/hr/leave';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { HrNotificationServiceContract } from '@/server/repositories/contracts/notifications/hr-notification-service-contract';
import type { NotificationDispatchContract } from '@/server/repositories/contracts/notifications/notification-dispatch-contract';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { ILeaveAttachmentRepository } from '@/server/repositories/contracts/hr/leave/leave-attachment-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';

export interface LeaveRepositoryDependencies {
  leaveRequestRepository: ILeaveRequestRepository;
  leaveBalanceRepository: ILeaveBalanceRepository;
  leavePolicyRepository: ILeavePolicyRepository;
  leaveAttachmentRepository: ILeaveAttachmentRepository;
  organizationRepository: IOrganizationRepository;
  profileRepository: IEmployeeProfileRepository;
  hrNotificationService?: HrNotificationServiceContract;
  notificationDispatchService?: NotificationDispatchContract;
}

export type Overrides = Partial<LeaveRepositoryDependencies>;

export interface LeaveServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildLeaveServiceDependencies(
  options?: LeaveServiceDependencyOptions,
): LeaveRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    leaveRequestRepository:
      options?.overrides?.leaveRequestRepository ?? new PrismaLeaveRequestRepository(repoOptions),
    leaveBalanceRepository:
      options?.overrides?.leaveBalanceRepository ?? new PrismaLeaveBalanceRepository(repoOptions),
    leavePolicyRepository:
      options?.overrides?.leavePolicyRepository ?? new PrismaLeavePolicyRepository(repoOptions),
    leaveAttachmentRepository:
      options?.overrides?.leaveAttachmentRepository ?? new PrismaLeaveAttachmentRepository(repoOptions),
    organizationRepository:
      options?.overrides?.organizationRepository ?? new PrismaOrganizationRepository({ prisma: prismaClient }),
    profileRepository:
      options?.overrides?.profileRepository ?? new PrismaEmployeeProfileRepository(repoOptions),
    hrNotificationService:
      options?.overrides?.hrNotificationService,
    notificationDispatchService:
      options?.overrides?.notificationDispatchService,
  };
}
