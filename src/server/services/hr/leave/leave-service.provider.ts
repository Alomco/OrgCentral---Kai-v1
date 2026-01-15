import { LeaveService, type LeaveServiceDependencies } from './leave-service';
import { getHrNotificationService } from '@/server/services/hr/notifications/hr-notification-service.provider';
import { getNotificationService } from '@/server/services/notifications/notification-service.provider';
import { buildLeaveServiceDependencies, type LeaveServiceDependencyOptions } from '@/server/repositories/providers/hr/leave-service-dependencies';

const sharedLeaveService = (() => {
  const dependencies = buildLeaveServiceDependencies({
    overrides: {
      hrNotificationService: getHrNotificationService(),
      notificationDispatchService: getNotificationService(),
    }
  });
  return new LeaveService(dependencies);
})();

export function getLeaveService(overrides?: Partial<LeaveServiceDependencies>, options?: LeaveServiceDependencyOptions): LeaveService {
  if (!overrides || Object.keys(overrides).length === 0) {
    return sharedLeaveService;
  }

  const dependencies = buildLeaveServiceDependencies({
    prismaOptions: options?.prismaOptions,
    overrides: {
      hrNotificationService: getHrNotificationService(),
      notificationDispatchService: getNotificationService(),
      ...overrides,
    }
  });

  return new LeaveService(dependencies);
}

export type LeaveServiceContract = Pick<
    LeaveService,
    | 'submitLeaveRequest'
    | 'addLeaveAttachments'
    | 'listLeaveAttachments'
    | 'presignLeaveAttachmentDownload'
    | 'approveLeaveRequest'
    | 'rejectLeaveRequest'
    | 'cancelLeaveRequest'
    | 'listLeaveRequests'
    | 'getLeaveRequest'
    | 'getLeaveBalance'
    | 'ensureEmployeeBalances'
    | 'createLeaveBalance'
>;

export interface LeaveServiceProvider {
    service: LeaveServiceContract;
}

export const defaultLeaveServiceProvider: LeaveServiceProvider = {
    service: getLeaveService(),
};
