/**
 * Example contract template for new repositories.
 * Copy and rename this file to the appropriate domain/subdomain and implement it.
 */

// Replace with your domain type
export interface ExampleDomainType {
    id: string;
}

export interface IExampleRepository {
    findById(id: string): Promise<ExampleDomainType | null>;
    findAll(filters?: { orgId?: string }): Promise<ExampleDomainType[]>;
    create(data: Partial<ExampleDomainType>): Promise<void>;
    update(id: string, data: Partial<ExampleDomainType>): Promise<void>;
    delete(id: string): Promise<void>;
}
