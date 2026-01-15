import type { LeaveBalance, LeaveRequest } from '@/server/types/leave-types';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import { calculateTotalDaysFromHours } from '@/server/domain/leave/leave-calculator';
import { toNumber } from '@/server/domain/absences/conversions';
import type { PrismaDecimal, PrismaJsonObject, PrismaJsonValue } from '@/server/types/prisma';

type LeaveRequestStatusCode =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'
    | 'PENDING_APPROVAL'
    | 'AWAITING_MANAGER';

interface LeaveRequestRecord {
    id: string;
    orgId: string;
    residencyTag: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    auditSource?: string | null;
    auditBatchId?: string | null;
    userId: string;
    policyId: string;
    startDate: Date;
    endDate: Date;
    reason?: string | null;
    hours: PrismaDecimal;
    status: LeaveRequestStatusCode;
    createdAt: Date;
    submittedAt?: Date | null;
    approverUserId?: string | null;
    decidedAt?: Date | null;
    metadata?: PrismaJsonValue | null;
}

interface LeaveBalanceRecord {
    id: string;
    orgId: string;
    residencyTag: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    auditSource?: string | null;
    auditBatchId?: string | null;
    userId: string;
    policyId: string;
    periodStart: Date;
    accruedHours: PrismaDecimal;
    usedHours: PrismaDecimal;
    carriedHours: PrismaDecimal;
    metadata?: PrismaJsonValue | null;
    updatedAt: Date;
}

type JsonLike = PrismaJsonValue | null | undefined;

const isJsonObject = (value: JsonLike): value is PrismaJsonObject =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const cloneJsonObject = (value: JsonLike): PrismaJsonObject => (
    isJsonObject(value) ? { ...value } : {}
);

const cloneLeaveRequestMetadata = (value: JsonLike): LeaveRequestMetadata => (
    cloneJsonObject(value) as LeaveRequestMetadata
);

const cloneLeaveBalanceMetadata = (value: JsonLike): LeaveBalanceMetadata => (
    cloneJsonObject(value) as LeaveBalanceMetadata
);

export type LeaveRequestMetadata = PrismaJsonObject & {
    employeeId?: string;
    employeeName?: string;
    leaveType?: string;
    coveringEmployee?: string | null;
    totalDays?: number;
    isHalfDay?: boolean;
    managerComments?: string | null;
    departmentId?: string | null;
};

export type LeaveBalanceMetadata = PrismaJsonObject & {
    employeeId?: string;
    leaveType?: string;
    year?: number;
    totalEntitlement?: number;
    used?: number;
    pending?: number;
    available?: number;
    // Compliance fields per DSPT requirements
    informationClass?: string;
    residencyRegion?: string;
    createdBy?: string;
    updatedBy?: string;
};

export const normalizeLeaveBalanceMetadata = (value: PrismaJsonValue | null): LeaveBalanceMetadata =>
    cloneLeaveBalanceMetadata(value);

const STATUS_FROM_DOMAIN: Record<LeaveRequest['status'], LeaveRequestStatusCode> = {
    submitted: 'SUBMITTED',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    cancelled: 'CANCELLED',
};

const STATUS_TO_DOMAIN: Record<LeaveRequestStatusCode, LeaveRequest['status']> = {
    DRAFT: 'submitted',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    PENDING_APPROVAL: 'submitted',
    AWAITING_MANAGER: 'submitted',
};

interface LeaveMapperConfig {
    hoursPerDay?: number;
}

export function mapPrismaLeaveRequestToDomain(
    record: LeaveRequestRecord & { _count?: { attachments?: number } },
    config?: LeaveMapperConfig,
): LeaveRequest {
    const metadata = cloneLeaveRequestMetadata(record.metadata);
    const totalHours = toNumber(record.hours);

    return {
        id: record.id,
        orgId: record.orgId,
        dataResidency: record.residencyTag,
        dataClassification: record.dataClassification,
        auditSource: record.auditSource ?? 'leave-request',
        auditBatchId: record.auditBatchId ?? undefined,
        employeeId: metadata.employeeId ?? record.userId,
        userId: record.userId,
        employeeName: metadata.employeeName ?? '',
        leaveType: metadata.leaveType ?? record.policyId,
        startDate: record.startDate.toISOString(),
        endDate: record.endDate.toISOString(),
        reason: record.reason ?? undefined,
        totalDays: metadata.totalDays ?? calculateTotalDaysFromHours(totalHours, { hoursPerDay: config?.hoursPerDay }),
        isHalfDay: metadata.isHalfDay ?? false,
        coveringEmployeeId: metadata.coveringEmployee ?? undefined,
        coveringEmployeeName: metadata.coveringEmployee ?? undefined,
        departmentId: metadata.departmentId ?? null,
        status: STATUS_TO_DOMAIN[record.status],
        createdAt: record.createdAt.toISOString(),
        createdBy: record.userId,
        submittedAt: record.submittedAt?.toISOString(),
        approvedBy: record.approverUserId ?? undefined,
        approvedAt: record.decidedAt?.toISOString(),
        rejectedBy: record.approverUserId ?? undefined,
        rejectedAt: record.decidedAt?.toISOString(),
        rejectionReason: record.reason ?? undefined,
        cancelledBy: undefined,
        cancelledAt: undefined,
        cancellationReason: undefined,
        managerComments: metadata.managerComments ?? undefined,
        attachmentCount: record._count?.attachments ?? 0,
    };
}

export function mapPrismaLeaveBalanceToDomain(record: LeaveBalanceRecord): LeaveBalance {
    const metadata = cloneLeaveBalanceMetadata(record.metadata);
    const accruedHours = toNumber(record.accruedHours);
    const usedHours = toNumber(record.usedHours);
    const carriedHours = toNumber(record.carriedHours);

    return {
        id: record.id,
        orgId: record.orgId,
        dataResidency: record.residencyTag,
        dataClassification: record.dataClassification,
        auditSource: record.auditSource ?? 'leave-balance',
        auditBatchId: record.auditBatchId ?? undefined,
        employeeId: metadata.employeeId ?? record.userId,
        leaveType: metadata.leaveType ?? record.policyId,
        year: metadata.year ?? record.periodStart.getUTCFullYear(),
        totalEntitlement: metadata.totalEntitlement ?? accruedHours,
        used: metadata.used ?? usedHours,
        pending: metadata.pending ?? carriedHours,
        available: metadata.available ?? metadata.totalEntitlement ?? accruedHours,
        createdAt: record.periodStart.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
    };
}

export function buildLeaveRequestMetadata(input: {
    employeeId: string;
    employeeName: string;
    coveringEmployee?: string;
    totalDays: number;
    isHalfDay: boolean;
    managerComments?: string;
    leaveType: string;
    departmentId?: string | null;
}): LeaveRequestMetadata & { leaveType: string } {
    return {
        leaveType: input.leaveType,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        coveringEmployee: input.coveringEmployee,
        totalDays: input.totalDays,
        isHalfDay: input.isHalfDay,
        managerComments: input.managerComments,
        departmentId: input.departmentId ?? null,
    } satisfies LeaveRequestMetadata & { leaveType: string };
}

export function buildLeaveBalanceMetadata(
    input: Omit<LeaveBalance, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>,
    auditContext?: { createdBy?: string; informationClass?: string; residencyRegion?: string }
): LeaveBalanceMetadata {
    return {
        employeeId: input.employeeId,
        leaveType: input.leaveType,
        year: input.year,
        totalEntitlement: input.totalEntitlement,
        used: input.used,
        pending: input.pending,
        available: input.available,
        // Compliance metadata (from audit context or defaults)
        informationClass: auditContext?.informationClass ?? input.dataClassification,
        residencyRegion: auditContext?.residencyRegion ?? input.dataResidency,
        createdBy: auditContext?.createdBy,
    } satisfies LeaveBalanceMetadata;
}

export function mapDomainStatusToPrisma(status: LeaveRequest['status']): LeaveRequestStatusCode {
    return STATUS_FROM_DOMAIN[status];
}
