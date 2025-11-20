/* eslint-disable */
/**
 * Prisma Repository implementation template.
 * Copy and rename to the appropriate domain (prisma/<domain>/...) and adapt to your model.
 */
import type { PrismaClient } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IExampleRepository } from '@/server/repositories/contracts/example/example-repository-contract';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { mapPrismaToDomain, mapDomainToPrisma } from '@/server/repositories/mappers/example/example-mapper';

export class PrismaExampleRepository extends BasePrismaRepository implements IExampleRepository {
    constructor(prisma: PrismaClient) { super(prisma); }

    async findById(id: string) {
        const rec = await getModelDelegate(this.prisma, 'example').findUnique({ where: { id } });
        if (!rec) { return null; }
        return mapPrismaToDomain(rec);
    }

    async findAll(filters?: { orgId?: string }) {
        const where: any = {};
        if (filters?.orgId) { where.orgId = filters.orgId; }
        const recs = await getModelDelegate(this.prisma, 'example').findMany({ where });
        return recs.map(mapPrismaToDomain);
    }

    async create(data: Partial<Record<string, unknown>>) {
        const payload = mapDomainToPrisma(data as any);
        await getModelDelegate(this.prisma, 'example').create({ data: payload as any });
    }

    async update(id: string, data: Partial<Record<string, unknown>>) {
        const payload = mapDomainToPrisma(data as any);
        await getModelDelegate(this.prisma, 'example').update({ where: { id }, data: payload as any });
    }

    async delete(id: string) {
        await getModelDelegate(this.prisma, 'example').delete({ where: { id } });
    }
}
