import type { HRPolicy as PrismaHRPolicy, PolicyAcknowledgment as PrismaPolicyAck } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { HRPolicy, PolicyAcknowledgment } from '@/server/types/hr-ops-types';

export function mapPrismaHRPolicyToDomain(record: PrismaHRPolicy): HRPolicy {
  return {
    id: record.id,
    orgId: record.orgId,
    title: record.title,
    content: record.content,
    category: record.category,
    version: record.version,
    effectiveDate: record.effectiveDate,
    expiryDate: record.expiryDate ?? undefined,
    applicableRoles: record.applicableRoles as Prisma.JsonValue | undefined,
    applicableDepartments: record.applicableDepartments as Prisma.JsonValue | undefined,
    requiresAcknowledgment: record.requiresAcknowledgment,
    status: record.status,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata as Prisma.JsonValue | undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainHRPolicyToPrismaCreate(
  input: Omit<HRPolicy, 'id' | 'createdAt' | 'updatedAt'>,
): Prisma.HRPolicyUncheckedCreateInput {
  return {
    orgId: input.orgId,
    title: input.title,
    content: input.content,
    category: input.category,
    version: input.version,
    effectiveDate: input.effectiveDate,
    expiryDate: input.expiryDate ?? null,
    applicableRoles: input.applicableRoles ?? undefined,
    applicableDepartments: input.applicableDepartments ?? undefined,
    requiresAcknowledgment: input.requiresAcknowledgment,
    status: input.status,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: input.metadata ?? undefined,
  };
}

export function mapDomainHRPolicyToPrismaUpdate(
  updates: Partial<Pick<HRPolicy, 'title' | 'content' | 'category' | 'version' | 'effectiveDate' | 'expiryDate' | 'applicableRoles' | 'applicableDepartments' | 'requiresAcknowledgment' | 'status' | 'dataClassification' | 'residencyTag' | 'metadata'>>,
): Prisma.HRPolicyUncheckedUpdateInput {
  return {
    title: updates.title ?? undefined,
    content: updates.content ?? undefined,
    category: updates.category ?? undefined,
    version: updates.version ?? undefined,
    effectiveDate: updates.effectiveDate ?? undefined,
    expiryDate: updates.expiryDate ?? undefined,
    applicableRoles: updates.applicableRoles ?? undefined,
    applicableDepartments: updates.applicableDepartments ?? undefined,
    requiresAcknowledgment: updates.requiresAcknowledgment ?? undefined,
    status: updates.status ?? undefined,
    dataClassification: updates.dataClassification ?? undefined,
    residencyTag: updates.residencyTag ?? undefined,
    metadata: updates.metadata ?? undefined,
  };
}

export function mapPrismaPolicyAckToDomain(record: PrismaPolicyAck): PolicyAcknowledgment {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    policyId: record.policyId,
    version: record.version,
    acknowledgedAt: record.acknowledgedAt,
    ipAddress: record.ipAddress ?? undefined,
    metadata: record.metadata as Prisma.JsonValue | undefined,
  };
}

export function mapDomainPolicyAckToPrismaCreate(
  input: Omit<PolicyAcknowledgment, 'id'>,
): Prisma.PolicyAcknowledgmentUncheckedCreateInput {
  return {
    orgId: input.orgId,
    userId: input.userId,
    policyId: input.policyId,
    version: input.version,
    acknowledgedAt: input.acknowledgedAt,
    ipAddress: input.ipAddress ?? null,
    metadata: input.metadata ?? undefined,
  };
}
