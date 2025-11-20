/* eslint-disable */
/**
 * Example mapper template for converting between Prisma models and domain models.
 */
import type { PrismaModel } from '@prisma/client';
import type { SomeDomainType } from '@/server/types/some-types';

export function mapPrismaToDomain(r: PrismaModel): SomeDomainType {
    return {
        // Map fields here
        id: r.id,
    } as SomeDomainType;
}

export function mapDomainToPrisma(d: SomeDomainType): PrismaModel | any {
    return {
        // Map fields here
        id: d.id,
    } as any;
}
