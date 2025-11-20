import type { ComplianceRecord } from '@prisma/client';
import type { ComplianceRecordFilters, ComplianceRecordCreationData, ComplianceRecordUpdateData } from '@/server/repositories/prisma/records/compliance/prisma-compliance-record-repository.types';

export interface IComplianceRecordRepository {
    findById(id: string): Promise<ComplianceRecord | null>;
    findByReferenceNumber(orgId: string, referenceNumber: string): Promise<ComplianceRecord | null>;
    findAll(filters?: ComplianceRecordFilters): Promise<ComplianceRecord[]>;
    create(data: ComplianceRecordCreationData): Promise<ComplianceRecord>;
    update(id: string, data: ComplianceRecordUpdateData): Promise<ComplianceRecord>;
    delete(id: string): Promise<ComplianceRecord>;
    updateStatus(id: string, status: string): Promise<ComplianceRecord>;
}
