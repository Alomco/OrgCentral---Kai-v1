import type { ChecklistInstance, ChecklistItemProgress } from '@/server/types/onboarding-types';

export interface ChecklistInstanceCreateInput {
    orgId: string;
    employeeId: string;
    templateId: string;
    templateName?: string;
    items: ChecklistItemProgress[];
    metadata?: Record<string, unknown>;
}

export interface ChecklistInstanceItemsUpdate {
    items: ChecklistItemProgress[];
    metadata?: Record<string, unknown>;
}

export interface IChecklistInstanceRepository {
    createInstance(input: ChecklistInstanceCreateInput): Promise<ChecklistInstance>;
    getInstance(orgId: string, instanceId: string): Promise<ChecklistInstance | null>;
    getActiveInstanceForEmployee(orgId: string, employeeId: string): Promise<ChecklistInstance | null>;
    listInstancesForEmployee(orgId: string, employeeId: string): Promise<ChecklistInstance[]>;
    updateItems(orgId: string, instanceId: string, updates: ChecklistInstanceItemsUpdate): Promise<ChecklistInstance>;
    completeInstance(orgId: string, instanceId: string): Promise<ChecklistInstance>;
    cancelInstance(orgId: string, instanceId: string): Promise<void>;
}
