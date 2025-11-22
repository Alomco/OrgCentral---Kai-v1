export type ChecklistTemplateType = 'onboarding' | 'offboarding' | 'custom';

export interface ChecklistTemplateItem {
    id?: string;
    label: string;
    description?: string;
    order?: number;
    metadata?: Record<string, unknown>;
}

export interface ChecklistTemplate {
    id: string;
    orgId: string;
    name: string;
    type: ChecklistTemplateType;
    items: ChecklistTemplateItem[];
    createdAt: Date;
    updatedAt: Date;
}

export type ChecklistInstanceStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ChecklistItemProgress {
    task: string;
    completed: boolean;
    completedAt?: Date | null;
    notes?: string | null;
}

export interface ChecklistInstance {
    id: string;
    orgId: string;
    employeeId: string;
    templateId: string;
    templateName?: string;
    status: ChecklistInstanceStatus;
    items: ChecklistItemProgress[];
    startedAt: Date;
    completedAt?: Date | null;
    metadata?: Record<string, unknown>;
}
