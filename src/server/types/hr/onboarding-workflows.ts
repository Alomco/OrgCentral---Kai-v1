import type { ContractMutationPayload, ContractTypeCode } from '@/server/types/hr/people';

export type EmploymentContractCreateInput = ContractMutationPayload['changes'] & {
    userId: string;
    contractType: ContractTypeCode;
    jobTitle: string;
    startDate: Date | string;
};

export interface OnboardingChecklistConfig {
    templateId: string;
    metadata?: Record<string, unknown>;
}
