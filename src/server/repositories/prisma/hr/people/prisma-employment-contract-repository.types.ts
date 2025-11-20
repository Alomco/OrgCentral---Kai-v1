import type { Prisma, ContractType } from '@prisma/client';

export interface EmploymentContractFilters {
    orgId?: string;
    userId?: string;
    contractType?: ContractType;
    departmentId?: string;
    active?: boolean;
}

export type EmploymentContractCreationData = Prisma.EmploymentContractUncheckedCreateInput;
export type EmploymentContractUpdateData = Prisma.EmploymentContractUncheckedUpdateInput;
