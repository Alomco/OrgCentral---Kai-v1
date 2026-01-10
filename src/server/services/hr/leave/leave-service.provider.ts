import { PrismaLeaveBalanceRepository, PrismaLeavePolicyRepository, PrismaLeaveRequestRepository, PrismaLeaveAttachmentRepository } from '@/server/repositories/prisma/hr/leave';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { LeaveService, type LeaveServiceDependencies } from './leave-service';
import { getHrNotificationService } from '@/server/services/hr/notifications/hr-notification-service.provider';
import { getNotificationService } from '@/server/services/notifications/notification-service.provider';

const leaveRequestRepository = new PrismaLeaveRequestRepository();
const leaveBalanceRepository = new PrismaLeaveBalanceRepository();
const leavePolicyRepository = new PrismaLeavePolicyRepository();
const leaveAttachmentRepository = new PrismaLeaveAttachmentRepository();
const organizationRepository = new PrismaOrganizationRepository();
const profileRepository = new PrismaEmployeeProfileRepository();
const defaultLeaveServiceDependencies: LeaveServiceDependencies = {
    leaveRequestRepository,
    leaveBalanceRepository,
    leavePolicyRepository,
    leaveAttachmentRepository,
    organizationRepository,
    profileRepository,
    hrNotificationService: getHrNotificationService(),
    notificationDispatchService: getNotificationService(),
};

const sharedLeaveService = new LeaveService(defaultLeaveServiceDependencies);

export function getLeaveService(overrides?: Partial<LeaveServiceDependencies>): LeaveService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedLeaveService;
    }

    return new LeaveService({
        ...defaultLeaveServiceDependencies,
        ...overrides,
    });
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
