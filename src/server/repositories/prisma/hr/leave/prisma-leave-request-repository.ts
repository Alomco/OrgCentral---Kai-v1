import { Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ILeaveRequestRepository, LeaveRequestCreateInput, LeaveRequestReadOptions } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { LeaveRequest } from '@/server/types/leave-types';
import {
    buildLeaveRequestMetadata,
    mapDomainStatusToPrisma,
    mapPrismaLeaveRequestToDomain,
} from '@/server/repositories/mappers/hr/leave/leave-mapper';
import { DEFAULT_WORKING_HOURS_PER_DAY } from '@/server/domain/leave/leave-calculator';
import { EntityNotFoundError } from '@/server/errors';
import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_LEAVE_REQUESTS } from '@/server/repositories/cache-scopes';

export class PrismaLeaveRequestRepository extends BasePrismaRepository implements ILeaveRequestRepository {

    async createLeaveRequest(tenantId: string, request: LeaveRequestCreateInput): Promise<void> {
        const hoursPerDay = request.hoursPerDay ?? DEFAULT_WORKING_HOURS_PER_DAY;
        const metadata = buildLeaveRequestMetadata({
            employeeId: request.employeeId,
            employeeName: request.employeeName,
            // prefer human name for the covering employee where available
            coveringEmployee: request.coveringEmployeeName ?? undefined,
            totalDays: request.totalDays,
            isHalfDay: request.isHalfDay,
            // ensure we don't pass explicit `null` to a string union
            managerComments: request.managerComments ?? undefined,
            leaveType: request.leaveType,
        });

        await this.prisma.leaveRequest.create({
            data: {
                id: request.id,
                orgId: tenantId,
                userId: request.userId,
                policyId: request.policyId,
                status: mapDomainStatusToPrisma('submitted'),
                startDate: new Date(request.startDate),
                endDate: new Date(request.endDate),
                hours: new Prisma.Decimal(request.totalDays * hoursPerDay),
                reason: request.reason ?? null,
                // Cast returned metadata to Prisma's InputJsonValue to satisfy the Prisma client types
                metadata: metadata as unknown as Prisma.InputJsonValue,
                submittedAt: new Date(),
            },
        });

        await invalidateOrgCache(tenantId, CACHE_SCOPE_LEAVE_REQUESTS);
    }

    async updateLeaveRequest(
        tenantId: string,
        requestId: string,
        updates: Partial<Pick<LeaveRequest,
            'status' | 'approvedBy' | 'approvedAt' | 'rejectedBy' | 'rejectedAt' |
            'rejectionReason' | 'cancelledBy' | 'cancelledAt' | 'cancellationReason' |
            'managerComments'>>,
    ): Promise<void> {
        const existing = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
        if (existing?.orgId !== tenantId) {
            throw new EntityNotFoundError('Leave request', { requestId, orgId: tenantId });
        }

        const metadata: Record<string, unknown> = {
            ...(existing.metadata as Record<string, unknown> | null),
        };

        if ('managerComments' in updates) {
            // managerComments can be null value, keep it as-is when intentionally set
            metadata.managerComments = updates.managerComments ?? undefined;
        }
        if (updates.cancellationReason !== undefined) {
            metadata.cancellationReason = updates.cancellationReason;
        }
        if (updates.cancelledBy !== undefined) {
            metadata.cancelledBy = updates.cancelledBy;
        }
        if (updates.cancelledAt !== undefined) {
            // updates.cancelledAt is a string (TimestampString) per contract; store as-is
            metadata.cancelledAt = updates.cancelledAt;
        }

        await this.prisma.leaveRequest.update({
            where: { id: requestId },
            data: {
                status: updates.status ? mapDomainStatusToPrisma(updates.status) : undefined,
                approverOrgId:
                    updates.approvedBy || updates.rejectedBy ? tenantId : existing.approverOrgId,
                approverUserId: updates.approvedBy ?? updates.rejectedBy ?? existing.approverUserId,
                // Prisma expects Date instances for date-time fields; convert from string timestamps if provided
                decidedAt: updates.approvedAt ? new Date(updates.approvedAt) : updates.rejectedAt ? new Date(updates.rejectedAt) : existing.decidedAt,
                reason: updates.rejectionReason ?? existing.reason,
                // Cast metadata to Prisma's expected JSON type
                metadata: metadata as unknown as Prisma.InputJsonValue,
            },
        });

        await invalidateOrgCache(tenantId, CACHE_SCOPE_LEAVE_REQUESTS);
    }

    async getLeaveRequest(tenantId: string, requestId: string, options?: LeaveRequestReadOptions) {
        const record = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
        if (record?.orgId !== tenantId) {
            return null;
        }
        return mapPrismaLeaveRequestToDomain(record, { hoursPerDay: options?.hoursPerDay });
    }

    async getLeaveRequestsByEmployee(tenantId: string, employeeId: string, options?: LeaveRequestReadOptions) {
        const records = await this.prisma.leaveRequest.findMany({
            where: {
                orgId: tenantId,
                userId: employeeId,
            },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((record) => mapPrismaLeaveRequestToDomain(record, { hoursPerDay: options?.hoursPerDay }));
    }

    async getLeaveRequestsByOrganization(
        tenantId: string,
        filters?: { status?: string; startDate?: Date; endDate?: Date },
        options?: LeaveRequestReadOptions,
    ) {
        const records = await this.prisma.leaveRequest.findMany({
            where: {
                orgId: tenantId,
                status: filters?.status ? mapDomainStatusToPrisma(filters.status as LeaveRequest['status']) : undefined,
                startDate: filters?.startDate ? { gte: filters.startDate } : undefined,
                endDate: filters?.endDate ? { lte: filters.endDate } : undefined,
            },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((record) => mapPrismaLeaveRequestToDomain(record, { hoursPerDay: options?.hoursPerDay }));
    }

    async countLeaveRequestsByPolicy(tenantId: string, policyId: string): Promise<number> {
        return this.prisma.leaveRequest.count({
            where: {
                orgId: tenantId,
                policyId,
            },
        });
    }
}
