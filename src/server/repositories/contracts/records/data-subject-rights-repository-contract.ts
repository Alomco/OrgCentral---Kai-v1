import type { DataSubjectRight } from '@prisma/client';
import type { DataSubjectRightFilters, DataSubjectRightCreationData, DataSubjectRightUpdateData } from '@/server/repositories/prisma/records/privacy/prisma-data-subject-rights-repository.types';

export interface IDataSubjectRightsRepository {
    findById(id: string): Promise<DataSubjectRight | null>;
    findByOrgAndRightType(orgId: string, rightType: string): Promise<DataSubjectRight[]>;
    findAll(filters?: DataSubjectRightFilters): Promise<DataSubjectRight[]>;
    create(data: DataSubjectRightCreationData): Promise<DataSubjectRight>;
    update(id: string, data: DataSubjectRightUpdateData): Promise<DataSubjectRight>;
    delete(id: string): Promise<DataSubjectRight>;
    markAsCompleted(id: string, response: string, responseFrom: string): Promise<DataSubjectRight>;
    updateStatus(id: string, status: string): Promise<DataSubjectRight>;
}
