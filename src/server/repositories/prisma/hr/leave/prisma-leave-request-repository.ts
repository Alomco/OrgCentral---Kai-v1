import { Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import type { LeaveRequest } from '@/server/types/leave-types';
import {
    buildLeaveRequestMetadata,
    mapDomainStatusToPrisma,
    mapPrismaLeaveRequestToDomain,
} from '@/server/repositories/mappers/hr/leave/leave-mapper';
import { invalidateOrgCache } from '@/server/lib/cache-tags';

export class PrismaLeaveRequestRepository extends BasePrismaRepository implements ILeaveRequestRepository {

    async createLeaveRequest(tenantId: string, request: Omit<LeaveRequest, 'createdAt'>): Promise<void> {
        const policyId = await this.ensurePolicyForLeaveType(tenantId, request.leaveType);
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
                policyId,
                status: mapDomainStatusToPrisma('submitted'),
                startDate: new Date(request.startDate),
                endDate: new Date(request.endDate),
                hours: new Prisma.Decimal(request.totalDays * 8),
                reason: request.reason ?? null,
                // Cast returned metadata to Prisma's InputJsonValue to satisfy the Prisma client types
                metadata: metadata as unknown as Prisma.InputJsonValue,
                submittedAt: new Date(),
            },
        });

        await invalidateOrgCache(tenantId, 'leave-requests');
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
            throw new Error('Leave request not found');
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

        await invalidateOrgCache(tenantId, 'leave-requests');
    }

    async getLeaveRequest(tenantId: string, requestId: string) {
        const record = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
        if (record?.orgId !== tenantId) {
            return null;
        }
        return mapPrismaLeaveRequestToDomain(record);
    }

    async getLeaveRequestsByEmployee(tenantId: string, employeeId: string) {
        const records = await this.prisma.leaveRequest.findMany({
            where: {
                orgId: tenantId,
                userId: employeeId,
            },
            orderBy: { createdAt: 'desc' },
        });
        return records.map(mapPrismaLeaveRequestToDomain);
    }

    async getLeaveRequestsByOrganization(
        tenantId: string,
        filters?: { status?: string; startDate?: Date; endDate?: Date },
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
        return records.map(mapPrismaLeaveRequestToDomain);
    }

    private async ensurePolicyForLeaveType(orgId: string, leaveType: string) {
        const existing = await this.prisma.leavePolicy.findFirst({
            where: { orgId, name: leaveType },
        });

        if (existing) {
            return existing.id;
        }

        const policy = await this.prisma.leavePolicy.create({
            data: {
                orgId,
                name: leaveType,
                policyType: 'SPECIAL',
                accrualFrequency: 'NONE',
                accrualAmount: new Prisma.Decimal(0),
                requiresApproval: true,
                metadata: { createdFromLeaveService: true },
            },
        });

        return policy.id;
    }
}
