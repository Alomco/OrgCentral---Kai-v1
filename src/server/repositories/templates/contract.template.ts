/* eslint-disable */
/**
 * Example contract template for new repositories.
 * Copy and rename this file to the appropriate domain/subdomain and implement it.
 */
import type { SomeDomainType } from '@/server/types/some-types';

export interface IExampleRepository {
    findById(id: string): Promise<SomeDomainType | null>;
    findAll(filters?: { orgId?: string }): Promise<SomeDomainType[]>;
    create(data: Partial<SomeDomainType>): Promise<void>;
    update(id: string, data: Partial<SomeDomainType>): Promise<void>;
    delete(id: string): Promise<void>;
}
