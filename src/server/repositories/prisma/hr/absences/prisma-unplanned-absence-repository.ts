import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import {
  mapDomainUnplannedAbsenceToPrismaCreate,
  mapDomainUnplannedAbsenceToPrismaUpdate,
  mapPrismaUnplannedAbsenceToDomain,
} from '@/server/repositories/mappers/hr/absences/absences-mapper';
import type {
  AbsenceAttachmentInput,
  AbsenceDeletionAuditEntry,
  ReturnToWorkRecordInput,
  UnplannedAbsence,
} from '@/server/types/hr-ops-types';
import type { Prisma, PrismaClient } from '@prisma/client';
import { AuthorizationError, EntityNotFoundError } from '@/server/errors';

const ABSENCE_RELATIONS = {
  attachments: true,
  returnRecord: true,
  deletionAudit: true,
} as const;

type AbsenceRecordWithRelations = Prisma.UnplannedAbsenceGetPayload<{
  include: typeof ABSENCE_RELATIONS;
}>;

export class PrismaUnplannedAbsenceRepository extends BasePrismaRepository implements IUnplannedAbsenceRepository {

  async createAbsence(
    orgId: string,
    input: Omit<UnplannedAbsence, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: UnplannedAbsence['status'] },
  ): Promise<UnplannedAbsence> {
    const data = mapDomainUnplannedAbsenceToPrismaCreate({ ...input, status: input.status ?? 'REPORTED' });
    const rec = await this.prisma.unplannedAbsence.create({ data });
    if (rec.orgId !== orgId) {
      throw new AuthorizationError('Cross-tenant absence creation mismatch', { orgId });
    }
    return mapPrismaUnplannedAbsenceToDomain(rec);
  }

  async updateAbsence(
    orgId: string,
    id: string,
    updates: Parameters<IUnplannedAbsenceRepository['updateAbsence']>[2],
  ): Promise<UnplannedAbsence> {
    const data = mapDomainUnplannedAbsenceToPrismaUpdate(updates);
    const rec = await this.prisma.unplannedAbsence.update({ where: { id }, data });
    if (rec.orgId !== orgId) {
      throw new AuthorizationError('Cross-tenant absence update mismatch', { orgId });
    }
    return mapPrismaUnplannedAbsenceToDomain(rec);
  }

  async getAbsence(orgId: string, id: string): Promise<UnplannedAbsence | null> {
    const rec = await this.prisma.unplannedAbsence.findFirst({
      where: { id, orgId },
      include: ABSENCE_RELATIONS,
    });
    return rec ? mapPrismaUnplannedAbsenceToDomain(rec) : null;
  }

  async listAbsences(
    orgId: string,
    filters?: { userId?: string; status?: UnplannedAbsence['status']; includeClosed?: boolean; from?: Date; to?: Date },
  ): Promise<UnplannedAbsence[]> {
    const where: Prisma.UnplannedAbsenceWhereInput = { orgId };
    const normalizedFilters = filters ?? {};
    const { userId, status, includeClosed, from, to } = normalizedFilters;

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    } else if (!includeClosed) {
      const statusFilter: Prisma.EnumAbsenceStatusFilter = { not: 'CLOSED' };
      where.status = statusFilter;
    }

    if (from || to) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (from) {
        dateFilter.gte = from;
      }
      if (to) {
        dateFilter.lte = to;
      }
      where.startDate = dateFilter;
    }

    const recs = await this.prisma.unplannedAbsence.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: ABSENCE_RELATIONS,
    });
    return recs.map(mapPrismaUnplannedAbsenceToDomain);
  }

  async recordReturnToWork(orgId: string, id: string, record: ReturnToWorkRecordInput): Promise<UnplannedAbsence> {
    return this.prisma.$transaction(async (tx) => {
      const absence = await this.ensureAbsence(tx, orgId, id);
      const submittedAt = record.submittedAt ?? new Date();

      await tx.absenceReturnRecord.upsert({
        where: { absenceId: id },
        create: {
          orgId,
          absenceId: id,
          returnDate: record.returnDate,
          comments: record.comments ?? null,
          submittedByUserId: record.submittedByUserId,
          submittedAt,
          metadata: record.metadata ?? undefined,
          dataClassification: record.dataClassification,
          residencyTag: record.residencyTag,
        },
        update: {
          returnDate: record.returnDate,
          comments: record.comments ?? null,
          submittedByUserId: record.submittedByUserId,
          submittedAt,
          metadata: record.metadata ?? undefined,
          dataClassification: record.dataClassification,
          residencyTag: record.residencyTag,
        },
      });

      const updated = await tx.unplannedAbsence.update({
        where: { id },
        data: {
          endDate: record.returnDate,
          status: absence.status === 'CANCELLED' ? absence.status : 'CLOSED',
        },
        include: ABSENCE_RELATIONS,
      });

      return mapPrismaUnplannedAbsenceToDomain(updated);
    });
  }

  async addAttachments(orgId: string, id: string, attachments: readonly AbsenceAttachmentInput[]): Promise<UnplannedAbsence> {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureAbsence(tx, orgId, id);
      await tx.absenceAttachment.createMany({
        data: attachments.map((attachment) => ({
          orgId,
          absenceId: id,
          fileName: attachment.fileName,
          storageKey: attachment.storageKey,
          contentType: attachment.contentType,
          fileSize: attachment.fileSize,
          checksum: attachment.checksum ?? null,
          uploadedByUserId: attachment.uploadedByUserId,
          uploadedAt: attachment.uploadedAt ?? new Date(),
          metadata: attachment.metadata ?? undefined,
          dataClassification: attachment.dataClassification,
          residencyTag: attachment.residencyTag,
        })),
      });

      const refreshed = await this.ensureAbsence(tx, orgId, id);
      return mapPrismaUnplannedAbsenceToDomain(refreshed);
    });
  }

  async removeAttachment(orgId: string, id: string, attachmentId: string): Promise<UnplannedAbsence> {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureAbsence(tx, orgId, id);
      const existing = await tx.absenceAttachment.findFirst({
        where: { id: attachmentId, absenceId: id, orgId },
      });
      if (!existing) {
        throw new EntityNotFoundError('Absence attachment', { attachmentId });
      }
      await tx.absenceAttachment.delete({ where: { id: attachmentId } });
      const refreshed = await this.ensureAbsence(tx, orgId, id);
      return mapPrismaUnplannedAbsenceToDomain(refreshed);
    });
  }

  async deleteAbsence(orgId: string, id: string, audit: AbsenceDeletionAuditEntry): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.ensureAbsence(tx, orgId, id);
      await tx.absenceDeletionAudit.upsert({
        where: { absenceId: id },
        create: {
          orgId,
          absenceId: id,
          reason: audit.reason,
          deletedByUserId: audit.deletedByUserId,
          deletedAt: audit.deletedAt,
          metadata: audit.metadata ?? undefined,
          dataClassification: audit.dataClassification,
          residencyTag: audit.residencyTag,
        },
        update: {
          reason: audit.reason,
          deletedByUserId: audit.deletedByUserId,
          deletedAt: audit.deletedAt,
          metadata: audit.metadata ?? undefined,
          dataClassification: audit.dataClassification,
          residencyTag: audit.residencyTag,
        },
      });

      await tx.unplannedAbsence.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          deletionReason: audit.reason,
          deletedAt: audit.deletedAt,
          deletedByUserId: audit.deletedByUserId,
        },
      });
    });
  }

  private async ensureAbsence(
    client: Prisma.TransactionClient | PrismaClient,
    orgId: string,
    id: string,
  ): Promise<AbsenceRecordWithRelations> {
    const record = await client.unplannedAbsence.findFirst({
      where: { id, orgId },
      include: ABSENCE_RELATIONS,
    });
    if (!record) {
      throw new EntityNotFoundError('Absence', { absenceId: id });
    }
    return record;
  }
}
