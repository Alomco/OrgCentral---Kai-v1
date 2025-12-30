export const CHECKLIST_TEMPLATE_TYPES = ['onboarding', 'offboarding', 'custom'] as const;
export type ChecklistTemplateType = (typeof CHECKLIST_TEMPLATE_TYPES)[number];

export interface ChecklistTemplateItem {
    id?: string;
    label: string;
    description?: string;
    order?: number;
    metadata?: Record<string, unknown>;
}

export type ChecklistTemplateItemInput = ChecklistTemplateItem;

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

export interface ChecklistTemplateCreatePayload {
    name: string;
    type: ChecklistTemplateType;
    items: ChecklistTemplateItemInput[];
}

export interface ChecklistTemplateUpdatePayload {
    name?: string;
    type?: ChecklistTemplateType;
    items?: ChecklistTemplateItemInput[];
}

export interface ChecklistTemplateListFilters {
    type?: ChecklistTemplateType;
}

export interface ChecklistInstanceItemsUpdate {
    items?: ChecklistItemProgress[];
    metadata?: Record<string, unknown>;
}
