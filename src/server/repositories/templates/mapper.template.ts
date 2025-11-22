/* eslint-disable */
/**
 * Example mapper template for converting between Prisma models and domain models.
 */

// Replace with actual Prisma model type
export interface ExamplePrismaModel {
    id: string;
}

// Replace with your domain type
export interface ExampleDomainType {
    id: string;
}

export function mapPrismaToDomain(r: ExamplePrismaModel): ExampleDomainType {
    return {
        // Map fields here
        id: r.id,
    };
}

export function mapDomainToPrisma(d: ExampleDomainType): ExamplePrismaModel {
    return {
        // Map fields here
        id: d.id,
    };
}
