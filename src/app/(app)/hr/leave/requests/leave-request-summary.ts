import type { LeaveRequest } from '@/server/types/leave-types';

export interface LeaveRequestSummary {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
}

export function buildLeaveRequestSummary(requests: LeaveRequest[]): LeaveRequestSummary {
    return requests.reduce<LeaveRequestSummary>(
        (summary, request) => {
            summary.total += 1;
            if (request.status === 'submitted') {
                summary.pending += 1;
            } else if (request.status === 'approved') {
                summary.approved += 1;
            } else if (request.status === 'rejected') {
                summary.rejected += 1;
            } else {
                summary.cancelled += 1;
            }
            return summary;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 },
    );
}
