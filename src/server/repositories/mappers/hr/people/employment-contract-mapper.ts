import type { EmploymentContract } from '@/server/types/hr-types';
import { Prisma, type EmploymentContract as PrismaEmploymentContract } from '@prisma/client';

type InputJsonValue = Prisma.InputJsonValue;

const toJsonInput = (value?: Prisma.JsonValue | null): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (value === null) { return Prisma.JsonNull; }
  if (value === undefined) { return undefined; }
  return value as Prisma.InputJsonValue;
};

export function mapPrismaEmploymentContractToDomain(record: PrismaEmploymentContract): EmploymentContract {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    contractType: record.contractType,
    jobTitle: record.jobTitle,
    departmentId: record.departmentId ?? null,
    startDate: record.startDate,
    endDate: record.endDate ?? null,
    probationEndDate: record.probationEndDate ?? null,
    furloughStartDate: record.furloughStartDate ?? null,
    furloughEndDate: record.furloughEndDate ?? null,
    workingPattern: record.workingPattern ?? null,
    benefits: record.benefits ?? null,
    terminationReason: record.terminationReason ?? null,
    terminationNotes: record.terminationNotes ?? null,
    archivedAt: record.archivedAt ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    location: record.location ?? null,
  };
}

export function mapDomainEmploymentContractToPrisma(
  input: EmploymentContract,
): Prisma.EmploymentContractUncheckedCreateInput {
  return {
    orgId: input.orgId,
    userId: input.userId,
    contractType: input.contractType,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    jobTitle: input.jobTitle,
    departmentId: input.departmentId ?? null,
    location: input.location ?? null,
    probationEndDate: input.probationEndDate ?? null,
    furloughStartDate: input.furloughStartDate ?? null,
    furloughEndDate: input.furloughEndDate ?? null,
    workingPattern: toJsonInput(input.workingPattern as Prisma.JsonValue | null | undefined),
    benefits: toJsonInput(input.benefits as Prisma.JsonValue | null | undefined),
    terminationReason: input.terminationReason ?? null,
    terminationNotes: input.terminationNotes ?? null,
    archivedAt: input.archivedAt ?? null,
  };
}

export function mapDomainEmploymentContractToPrismaUpdate(
  updates: Partial<Omit<EmploymentContract, 'id' | 'orgId' | 'userId' | 'createdAt'>>,
): Prisma.EmploymentContractUncheckedUpdateInput {
  const data: Prisma.EmploymentContractUncheckedUpdateInput = {};
  if (updates.contractType !== undefined) data.contractType = updates.contractType;
  if (updates.jobTitle !== undefined) data.jobTitle = updates.jobTitle;
  if (updates.departmentId !== undefined) data.departmentId = updates.departmentId ?? null;
  if (updates.startDate !== undefined) data.startDate = updates.startDate;
  if (updates.endDate !== undefined) data.endDate = updates.endDate ?? null;
  if (updates.probationEndDate !== undefined) data.probationEndDate = updates.probationEndDate ?? null;
  if (updates.furloughStartDate !== undefined) data.furloughStartDate = updates.furloughStartDate ?? null;
  if (updates.furloughEndDate !== undefined) data.furloughEndDate = updates.furloughEndDate ?? null;
  if (updates.workingPattern !== undefined) data.workingPattern = toJsonInput(updates.workingPattern as Prisma.JsonValue | null | undefined);
  if (updates.benefits !== undefined) data.benefits = toJsonInput(updates.benefits as Prisma.JsonValue | null | undefined);
  if (updates.terminationReason !== undefined) data.terminationReason = updates.terminationReason ?? null;
  if (updates.terminationNotes !== undefined) data.terminationNotes = updates.terminationNotes ?? null;
  if (updates.archivedAt !== undefined) data.archivedAt = updates.archivedAt ?? null;
  if (updates.location !== undefined) data.location = updates.location ?? null;
  return data;
}
