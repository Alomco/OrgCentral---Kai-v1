import type { TrainingRecord } from '@/server/types/hr-types';
import type { TrainingRecordCreationData, TrainingRecordUpdateData } from '@/server/repositories/prisma/hr/training/prisma-training-record-repository.types';
import { Prisma, type TrainingRecord as PrismaTrainingRecord } from '@prisma/client';

function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value === null || value === undefined) { return null; }
    if (typeof value === 'number') { return value; }
    try {
        return (value).toNumber();
    } catch {
        return null;
    }
}

export function mapPrismaTrainingRecordToDomain(record: PrismaTrainingRecord): TrainingRecord {
    return {
        id: record.id,
        orgId: record.orgId,
        userId: record.userId,
        courseName: record.courseName,
        provider: record.provider,
        startDate: record.startDate,
        endDate: record.endDate ?? null,
        expiryDate: record.expiryDate ?? null,
        renewalDate: record.renewalDate ?? null,
        status: record.status,
        certificate: record.certificate ?? null,
        competency: record.competency,
        cost: decimalToNumber(record.cost),
        approved: record.approved,
        approvedAt: record.approvedAt ?? null,
        approvedBy: record.approvedBy ?? null,
        metadata: record.metadata,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapDomainTrainingRecordToPrisma(input: TrainingRecord): TrainingRecordCreationData {
    return {
        orgId: input.orgId,
        userId: input.userId,
        courseName: input.courseName,
        provider: input.provider,
        startDate: input.startDate,
        endDate: input.endDate ?? null,
        expiryDate: input.expiryDate ?? null,
        renewalDate: input.renewalDate ?? null,
        status: input.status,
        certificate: input.certificate ?? null,
        competency: input.competency === null ? Prisma.JsonNull : (input.competency as Prisma.InputJsonValue | undefined),
        cost: input.cost ?? null,
        approved: input.approved,
        approvedAt: input.approvedAt ?? null,
        approvedBy: input.approvedBy ?? null,
        metadata: input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue | undefined),
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

export function mapDomainTrainingUpdateToPrisma(input: Partial<Omit<TrainingRecord, 'id' | 'orgId' | 'createdAt' | 'userId'>>): Partial<TrainingRecordUpdateData> {
    const update: Partial<TrainingRecordUpdateData> = {};
    if (input.startDate !== undefined) { update.startDate = input.startDate; }
    if (input.endDate !== undefined) { update.endDate = input.endDate ?? null; }
    if (input.expiryDate !== undefined) { update.expiryDate = input.expiryDate ?? null; }
    if (input.renewalDate !== undefined) { update.renewalDate = input.renewalDate ?? null; }
    if (input.status !== undefined) { update.status = input.status; }
    if (input.certificate !== undefined) { update.certificate = input.certificate ?? null; }
    if (input.competency !== undefined) { update.competency = input.competency === null ? Prisma.JsonNull : (input.competency as Prisma.InputJsonValue | undefined); }
    if (input.cost !== undefined) { update.cost = input.cost ?? null; }
    if (input.approved !== undefined) { update.approved = input.approved; }
    if (input.approvedAt !== undefined) { update.approvedAt = input.approvedAt ?? null; }
    if (input.approvedBy !== undefined) { update.approvedBy = input.approvedBy ?? null; }
    if (input.metadata !== undefined) { update.metadata = input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue | undefined); }
    if (input.courseName !== undefined) { update.courseName = input.courseName; }
    if (input.provider !== undefined) { update.provider = input.provider; }
    return update;
}
