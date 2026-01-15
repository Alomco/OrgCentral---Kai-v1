import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { AuditLogRecord, AuditLogCreationData, AuditLogFilters } from '@/server/types/records/audit-log';

export interface IAuditLogRepository {
    findById(context: RepositoryAuthorizationContext, id: string): Promise<AuditLogRecord | null>;
    findAll(context: RepositoryAuthorizationContext, filters?: AuditLogFilters): Promise<AuditLogRecord[]>;
    create(context: RepositoryAuthorizationContext, data: AuditLogCreationData): Promise<AuditLogRecord>;
    createBulk(context: RepositoryAuthorizationContext, data: AuditLogCreationData[]): Promise<AuditLogRecord[]>;
    delete(context: RepositoryAuthorizationContext, id: string): Promise<AuditLogRecord>;
    deleteByRetentionPolicy(context: RepositoryAuthorizationContext, retentionDate: Date): Promise<number>;
}
