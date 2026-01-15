import { buildLeaveServiceDependencies } from '@/server/repositories/providers/hr/leave-service-dependencies';

export function createLeavePolicyRepository() {
    const { leavePolicyRepository } = buildLeaveServiceDependencies();
    return leavePolicyRepository;
}

export function createLeaveAttachmentRepository() {
    const { leaveAttachmentRepository } = buildLeaveServiceDependencies();
    return leaveAttachmentRepository;
}

export function createLeaveRequestRepository() {
    const { leaveRequestRepository } = buildLeaveServiceDependencies();
    return leaveRequestRepository;
}
