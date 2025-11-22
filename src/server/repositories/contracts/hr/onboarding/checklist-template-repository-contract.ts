import type {
    ChecklistTemplate,
    ChecklistTemplateItem,
    ChecklistTemplateType,
} from '@/server/types/onboarding-types';

export interface ChecklistTemplateCreateInput {
    orgId: string;
    name: string;
    type: ChecklistTemplateType;
    items: ChecklistTemplateItem[];
}

export interface ChecklistTemplateUpdateInput {
    name?: string;
    type?: ChecklistTemplateType;
    items?: ChecklistTemplateItem[];
}

export interface IChecklistTemplateRepository {
    createTemplate(input: ChecklistTemplateCreateInput): Promise<ChecklistTemplate>;
    updateTemplate(orgId: string, templateId: string, updates: ChecklistTemplateUpdateInput): Promise<ChecklistTemplate>;
    deleteTemplate(orgId: string, templateId: string): Promise<void>;
    getTemplate(orgId: string, templateId: string): Promise<ChecklistTemplate | null>;
    listTemplates(orgId: string): Promise<ChecklistTemplate[]>;
}
