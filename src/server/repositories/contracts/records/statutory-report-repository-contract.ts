import type { StatutoryReport } from '@prisma/client';
import type { StatutoryReportFilters, StatutoryReportCreationData, StatutoryReportUpdateData } from '@/server/repositories/prisma/records/statutory/prisma-statutory-report-repository.types';

export interface IStatutoryReportRepository {
    findById(id: string): Promise<StatutoryReport | null>;
    findByOrgAndTypeAndPeriod(orgId: string, reportType: string, period: string): Promise<StatutoryReport | null>;
    findAll(filters?: StatutoryReportFilters): Promise<StatutoryReport[]>;
    create(data: StatutoryReportCreationData): Promise<StatutoryReport>;
    update(id: string, data: StatutoryReportUpdateData): Promise<StatutoryReport>;
    delete(id: string): Promise<StatutoryReport>;
    markAsSubmitted(id: string, submittedByOrgId: string, submittedByUserId: string): Promise<StatutoryReport>;
}
