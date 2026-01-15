import type { IDocumentVaultRepository } from '@/server/repositories/contracts/records/document-vault-repository-contract';
import { getModelDelegate, toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { DocumentVaultFilters, DocumentVaultCreationData, DocumentVaultUpdateData } from './prisma-document-vault-repository.types';
import { Prisma } from '@/server/types/prisma';
import type { PrismaDocumentVault, SecurityClassification } from '@/server/types/prisma';

export class PrismaDocumentVaultRepository extends BasePrismaRepository implements IDocumentVaultRepository {
  async findById(id: string): Promise<PrismaDocumentVault | null> {
    return getModelDelegate(this.prisma, 'documentVault').findUnique({
      where: { id },
    });
  }

  async findByBlobPointer(blobPointer: string): Promise<PrismaDocumentVault | null> {
    return getModelDelegate(this.prisma, 'documentVault').findFirst({ where: { blobPointer } });
  }

  async findAll(filters?: DocumentVaultFilters): Promise<PrismaDocumentVault[]> {
    const whereClause: Prisma.DocumentVaultWhereInput = {};

    if (filters?.orgId) {
      whereClause.orgId = filters.orgId;
    }

    if (filters?.ownerUserId) {
      whereClause.ownerUserId = filters.ownerUserId;
    }

    if (filters?.type) {
      whereClause.type = filters.type;
    }

    if (filters?.classification) {
      whereClause.classification = filters.classification as SecurityClassification;
    }

    if (filters?.retentionPolicy) {
      whereClause.retentionPolicy = filters.retentionPolicy;
    }

    if (filters?.fileName) {
      whereClause.fileName = { contains: filters.fileName, mode: 'insensitive' };
    }

    return getModelDelegate(this.prisma, 'documentVault').findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: DocumentVaultCreationData): Promise<PrismaDocumentVault> {
    return getModelDelegate(this.prisma, 'documentVault').create({
      data: {
        ...data,
        version: data.version ?? 1,
        encrypted: data.encrypted ?? false,
        sensitivityLevel: data.sensitivityLevel ?? 0,
        dataSubject:
          data.dataSubject === undefined
            ? undefined
            : toPrismaInputJson(data.dataSubject) ?? Prisma.JsonNull,
        metadata:
          data.metadata === undefined
            ? undefined
            : toPrismaInputJson(data.metadata) ?? Prisma.JsonNull,
      },
    });
  }

  async update(id: string, data: DocumentVaultUpdateData): Promise<PrismaDocumentVault> {
    const updateData = {
      ...data,
      dataSubject:
        data.dataSubject === undefined
          ? undefined
          : toPrismaInputJson(data.dataSubject) ?? Prisma.JsonNull,
      metadata:
        data.metadata === undefined
          ? undefined
          : toPrismaInputJson(data.metadata) ?? Prisma.JsonNull,
    };
    return getModelDelegate(this.prisma, 'documentVault').update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<PrismaDocumentVault> {
    return getModelDelegate(this.prisma, 'documentVault').delete({
      where: { id },
    });
  }
}
