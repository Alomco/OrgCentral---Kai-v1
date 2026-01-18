import type { OffboardingRecord, OffboardingCreateInput, OffboardingUpdateInput } from '@/server/types/hr/offboarding-types';

export interface OffboardingListFilters {
    status?: OffboardingRecord['status'];
    employeeId?: string;
}

export interface IOffboardingRepository {
    createOffboarding(input: OffboardingCreateInput): Promise<OffboardingRecord>;
    updateOffboarding(orgId: string, offboardingId: string, updates: OffboardingUpdateInput): Promise<OffboardingRecord>;
    getOffboarding(orgId: string, offboardingId: string): Promise<OffboardingRecord | null>;
    getOffboardingByEmployee(orgId: string, employeeId: string): Promise<OffboardingRecord | null>;
    listOffboarding(orgId: string, filters?: OffboardingListFilters): Promise<OffboardingRecord[]>;
}
