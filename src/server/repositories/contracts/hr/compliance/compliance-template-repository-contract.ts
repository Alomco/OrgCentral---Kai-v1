import type {
    ComplianceSubDocumentType,
    ComplianceTemplate,
    ComplianceTemplateItem,
} from '@/server/types/compliance-types';

export interface ComplianceTemplateCreateInput {
    orgId: string;
    name: string;
    items: ComplianceTemplateItem[];
    categoryKey?: string;
    version?: string;
}

export interface ComplianceTemplateUpdateInput {
    name?: string;
    items?: ComplianceTemplateItem[];
    categoryKey?: string;
    version?: string;
}

export interface IComplianceTemplateRepository {
    createTemplate(input: ComplianceTemplateCreateInput): Promise<ComplianceTemplate>;
    updateTemplate(orgId: string, templateId: string, updates: ComplianceTemplateUpdateInput): Promise<ComplianceTemplate>;
    deleteTemplate(orgId: string, templateId: string): Promise<void>;
    getTemplate(orgId: string, templateId: string): Promise<ComplianceTemplate | null>;
    listTemplates(orgId: string): Promise<ComplianceTemplate[]>;
}
