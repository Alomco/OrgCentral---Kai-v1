import { z } from 'zod';
import { LEAVE_STATUSES } from '@/server/types/leave-types';

type LeaveStatusLiteral = (typeof LEAVE_STATUSES)[number];
const leaveStatusValues = [...LEAVE_STATUSES] as [LeaveStatusLiteral, ...LeaveStatusLiteral[]];

export const leaveRequestFiltersSchema = z.object({
    employeeId: z.uuid().optional(),
    status: z.enum(leaveStatusValues).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

export const submitLeaveRequestSchema = z.object({
    id: z.uuid().optional(),
    employeeId: z.uuid(),
    userId: z.uuid().optional(),
    employeeName: z.string().trim().min(1).max(120),
    leaveType: z.string().trim().min(2).max(64),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    totalDays: z.number().positive().max(365),
    isHalfDay: z.boolean().optional(),
    coveringEmployeeId: z.uuid().optional(),
    coveringEmployeeName: z.string().trim().min(1).max(120).optional(),
    reason: z.string().max(2000).optional(),
    managerComments: z.string().max(2000).optional(),
});

export const approveLeaveRequestSchema = z.object({
    approverId: z.uuid().optional(),
    comments: z.string().max(2000).optional(),
});

export const rejectLeaveRequestSchema = z.object({
    rejectedBy: z.uuid().optional(),
    reason: z.string().trim().min(5).max(2000),
    comments: z.string().max(2000).optional(),
});

export const cancelLeaveRequestSchema = z.object({
    cancelledBy: z.uuid().optional(),
    reason: z.string().max(2000).optional(),
});

export const leaveBalanceQuerySchema = z.object({
    employeeId: z.uuid(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const leaveBalancePayloadSchema = z.object({
    id: z.uuid().optional(),
    employeeId: z.uuid(),
    leaveType: z.string().trim().min(2).max(64),
    year: z.coerce.number().int().min(2000).max(2100),
    totalEntitlement: z.number().nonnegative(),
    used: z.number().nonnegative().optional().default(0),
    pending: z.number().nonnegative().optional().default(0),
    available: z.number().nonnegative().optional(),
});

export const ensureLeaveBalancesSchema = z.object({
    employeeId: z.uuid(),
    year: z.coerce.number().int().min(2000).max(2100),
    leaveTypes: z.array(z.string().trim().min(2).max(64)).min(1),
});

export type LeaveRequestFiltersPayload = z.infer<typeof leaveRequestFiltersSchema>;
export type SubmitLeaveRequestPayload = z.infer<typeof submitLeaveRequestSchema>;
export type ApproveLeaveRequestPayload = z.infer<typeof approveLeaveRequestSchema>;
export type RejectLeaveRequestPayload = z.infer<typeof rejectLeaveRequestSchema>;
export type CancelLeaveRequestPayload = z.infer<typeof cancelLeaveRequestSchema>;
export type LeaveBalanceQueryPayload = z.infer<typeof leaveBalanceQuerySchema>;
export type LeaveBalancePayload = z.infer<typeof leaveBalancePayloadSchema>;
export type EnsureLeaveBalancesPayload = z.infer<typeof ensureLeaveBalancesSchema>;
