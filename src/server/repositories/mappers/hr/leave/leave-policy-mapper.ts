import type { Prisma, LeavePolicy as PrismaLeavePolicy } from '@prisma/client';
import type { LeavePolicy as DomainLeavePolicy, LeavePolicyType, LeaveAccrualFrequency } from '@/server/types/leave-types';
import type { LeavePolicyCreationData, LeavePolicyUpdateData } from '@/server/repositories/prisma/hr/leave/prisma-leave-policy-repository.types';

export function mapCreateToPrisma(input: LeavePolicyCreationData): Prisma.LeavePolicyUncheckedCreateInput {
    const {
        orgId,
        departmentId,
        name,
        policyType,
        accrualFrequency,
        accrualAmount,
        carryOverLimit,
        requiresApproval,
        isDefault,
        activeFrom,
        activeTo,
        statutoryCompliance,
        maxConsecutiveDays,
        allowNegativeBalance,
        metadata,
    } = input;

    return {
        orgId,
        departmentId: departmentId ?? undefined,
        name,
        policyType,
        accrualFrequency,
        accrualAmount: accrualAmount ?? undefined,
        carryOverLimit: carryOverLimit ?? undefined,
        requiresApproval: requiresApproval ?? true,
        isDefault: isDefault ?? false,
        activeFrom: activeFrom instanceof Date ? activeFrom : new Date(activeFrom),
        activeTo: activeTo ? (activeTo instanceof Date ? activeTo : new Date(activeTo)) : undefined,
        statutoryCompliance: statutoryCompliance ?? false,
        maxConsecutiveDays: maxConsecutiveDays ?? undefined,
        allowNegativeBalance: allowNegativeBalance ?? false,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue,
    } as Prisma.LeavePolicyUncheckedCreateInput;
}

export function buildPrismaLeavePolicyUpdate(updates: Partial<LeavePolicyUpdateData>): Prisma.LeavePolicyUncheckedUpdateInput {
    const prismaUpdate: Prisma.LeavePolicyUncheckedUpdateInput = {};

    if (Object.prototype.hasOwnProperty.call(updates, 'departmentId')) {
        prismaUpdate.departmentId = updates.departmentId as string | null;
    }
    if (updates.accrualFrequency !== undefined) {
        prismaUpdate.accrualFrequency = updates.accrualFrequency;
    }
    if (updates.accrualAmount !== undefined) {
        prismaUpdate.accrualAmount = updates.accrualAmount;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'carryOverLimit')) {
        prismaUpdate.carryOverLimit = updates.carryOverLimit as number | null;
    }
    if (updates.requiresApproval !== undefined) {
        prismaUpdate.requiresApproval = updates.requiresApproval;
    }
    if (updates.isDefault !== undefined) {
        prismaUpdate.isDefault = updates.isDefault;
    }
    if (updates.activeFrom !== undefined) {
        prismaUpdate.activeFrom = updates.activeFrom;
    }
    if (updates.activeTo !== undefined) {
        prismaUpdate.activeTo = updates.activeTo;
    }
    if (updates.statutoryCompliance !== undefined) {
        prismaUpdate.statutoryCompliance = updates.statutoryCompliance;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'maxConsecutiveDays')) {
        prismaUpdate.maxConsecutiveDays = updates.maxConsecutiveDays as number | null;
    }
    if (updates.allowNegativeBalance !== undefined) {
        prismaUpdate.allowNegativeBalance = updates.allowNegativeBalance;
    }
    if (updates.metadata !== undefined) {
        prismaUpdate.metadata = updates.metadata ? (updates.metadata as Prisma.InputJsonValue) : undefined;
    }

    return prismaUpdate;
}

export function mapPrismaToDomain(record: PrismaLeavePolicy): DomainLeavePolicy {
    return {
        id: record.id,
        orgId: record.orgId,
        name: record.name,
        policyType: record.policyType as LeavePolicyType,
        accrualFrequency: record.accrualFrequency as LeaveAccrualFrequency,
        accrualAmount: record.accrualAmount ? Number(record.accrualAmount) : undefined,
        carryOverLimit: record.carryOverLimit ?? undefined,
        requiresApproval: record.requiresApproval,
        isDefault: record.isDefault,
        activeFrom: record.activeFrom.toISOString(),
        activeTo: record.activeTo?.toISOString(),
        statutoryCompliance: record.statutoryCompliance,
        maxConsecutiveDays: record.maxConsecutiveDays ?? undefined,
        allowNegativeBalance: record.allowNegativeBalance,
        metadata: record.metadata ?? null,
        createdAt: record.activeFrom.toISOString(),
        updatedAt: record.activeTo ? record.activeTo.toISOString() : record.activeFrom.toISOString(),
    } as DomainLeavePolicy;
}

const exported = {
    mapCreateToPrisma,
    buildPrismaLeavePolicyUpdate,
    mapPrismaToDomain,
};
export default exported;
