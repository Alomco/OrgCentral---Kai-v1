import type { AuditLog } from '@prisma/client';
import type { AuditLogCreationData, AuditLogFilters } from '@/server/repositories/prisma/records/audit/prisma-audit-log-repository.types';

export interface IAuditLogRepository {
    findById(id: string): Promise<AuditLog | null>;
    findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;
    create(data: AuditLogCreationData): Promise<AuditLog>;
    createBulk(data: AuditLogCreationData[]): Promise<AuditLog[]>;
    delete(id: string): Promise<AuditLog>;
    deleteByRetentionPolicy(orgId: string, retentionDate: Date): Promise<number>;
}
