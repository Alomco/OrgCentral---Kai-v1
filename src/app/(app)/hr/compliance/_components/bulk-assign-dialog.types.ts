export interface Employee {
    id: string;
    name: string;
    department: string;
}

export interface TemplateItem {
    id: string;
    name: string;
}

export interface Template {
    id: string;
    name: string;
    category: string;
    items: TemplateItem[];
}

export interface BulkAssignDialogProps {
    templates: Template[];
    employees: Employee[];
    onAssign?: (
        templateId: string,
        templateItemIds: string[],
        employeeIds: string[],
    ) => Promise<void>;
}
