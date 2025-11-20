import { Prisma } from '@prisma/client';
// No constructor required; use DI via BasePrismaRepository
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { LeaveBalance } from '@/server/types/leave-types';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { buildLeaveBalanceMetadata, mapPrismaLeaveBalanceToDomain } from '@/server/repositories/mappers/hr/leave/leave-mapper';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';

const CACHE_TAG = 'leave-balances';

export class PrismaLeaveBalanceRepository extends BasePrismaRepository implements ILeaveBalanceRepository {
    async createLeaveBalance(tenantId: string, balance: Omit<LeaveBalance, 'createdAt' | 'updatedAt'>): Promise<void> {
        const policyId = await this.ensurePolicyForLeaveType(tenantId, balance.leaveType);
        const periodStart = new Date(Date.UTC(balance.year, 0, 1));
        const periodEnd = new Date(Date.UTC(balance.year, 11, 31, 23, 59, 59, 999));

        await this.prisma.leaveBalance.create({
            data: {
                id: balance.id,
                orgId: tenantId,
                userId: balance.employeeId,
                policyId,
                periodStart,
                periodEnd,
                accruedHours: new Prisma.Decimal(balance.totalEntitlement),
                usedHours: new Prisma.Decimal(balance.used),
                carriedHours: new Prisma.Decimal(balance.pending),
                metadata: buildLeaveBalanceMetadata(balance) as unknown as Prisma.InputJsonValue,
            },
        });

        await invalidateOrgCache(tenantId, CACHE_TAG);
    }

    async updateLeaveBalance(
        tenantId: string,
        balanceId: string,
        updates: Partial<{ used: number; pending: number; available: number; updatedAt: Date }>,
    ): Promise<void> {
        const existing = await this.prisma.leaveBalance.findUnique({ where: { id: balanceId } });
        if (existing?.orgId !== tenantId) {
            throw new Error('Leave balance not found');
        }

        const metadata: Record<string, unknown> = {
            ...(existing.metadata as Record<string, unknown> | null),
        };

        if (updates.used !== undefined) { metadata.used = updates.used; }
        if (updates.pending !== undefined) { metadata.pending = updates.pending; }
        if (updates.available !== undefined) { metadata.available = updates.available; }

        await this.prisma.leaveBalance.update({
            where: { id: balanceId },
            data: {
                usedHours: updates.used !== undefined ? new Prisma.Decimal(updates.used) : undefined,
                carriedHours: updates.pending !== undefined ? new Prisma.Decimal(updates.pending) : undefined,
                metadata: metadata as unknown as Prisma.InputJsonValue,
            },
        });

        await invalidateOrgCache(tenantId, CACHE_TAG);
    }

    async getLeaveBalance(tenantId: string, balanceId: string) {
        registerOrgCacheTag(tenantId, CACHE_TAG);
        const record = await this.prisma.leaveBalance.findUnique({ where: { id: balanceId } });
        if (record?.orgId !== tenantId) {
            return null;
        }
        return mapPrismaLeaveBalanceToDomain(record);
    }

    async getLeaveBalancesByEmployeeAndYear(tenantId: string, employeeId: string, year: number) {
        registerOrgCacheTag(tenantId, CACHE_TAG);
        const periodStart = new Date(Date.UTC(year, 0, 1));
        const periodEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

        const records = await this.prisma.leaveBalance.findMany({
            where: {
                orgId: tenantId,
                userId: employeeId,
                periodStart: { gte: periodStart },
                periodEnd: { lte: periodEnd },
            },
        });

        return records.map(mapPrismaLeaveBalanceToDomain);
    }

    async getLeaveBalancesByEmployee(tenantId: string, employeeId: string) {
        registerOrgCacheTag(tenantId, CACHE_TAG);
        const records = await this.prisma.leaveBalance.findMany({
            where: {
                orgId: tenantId,
                userId: employeeId,
            },
            orderBy: { updatedAt: 'desc' },
        });

        return records.map(mapPrismaLeaveBalanceToDomain);
    }

    private async ensurePolicyForLeaveType(orgId: string, leaveType: string) {
        const existing = await this.prisma.leavePolicy.findFirst({ where: { orgId, name: leaveType } });
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

        // Invalidate leave policies cache when a new one is created
        await invalidateOrgCache(orgId, 'leave-policies');

        return policy.id;
    }
}
