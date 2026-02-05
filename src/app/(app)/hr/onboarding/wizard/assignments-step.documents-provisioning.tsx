import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { DocumentTemplateRecord } from '@/server/types/records/document-templates';

export interface DocumentsProvisioningCardsProps {
    values: OnboardingWizardValues;
    documentTemplates: DocumentTemplateRecord[];
    provisioningTaskOptions: { value: string; label: string }[];
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    documentError?: string;
    disabled?: boolean;
}

export function DocumentsProvisioningCards({
    values,
    documentTemplates,
    provisioningTaskOptions,
    onValuesChange,
    documentError,
    disabled = false,
}: DocumentsProvisioningCardsProps) {
    const selectedDocuments = values.documentTemplateIds ?? [];
    const selectedProvisioningTasks = values.provisioningTaskTypes ?? [];

    const handleDocumentToggle = (templateId: string, checked: boolean) => {
        const updated = checked
            ? [...selectedDocuments, templateId]
            : selectedDocuments.filter((id) => id !== templateId);
        onValuesChange({ documentTemplateIds: updated });
    };

    const handleProvisioningToggle = (taskType: string, checked: boolean) => {
        const updated = checked
            ? [...selectedProvisioningTasks, taskType]
            : selectedProvisioningTasks.filter((value) => value !== taskType);
        onValuesChange({ provisioningTaskTypes: updated });
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Required Documents</CardTitle>
                    <CardDescription>
                        Select document templates that must be completed during onboarding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {documentTemplates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No document templates are configured yet.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {documentTemplates.map((template) => {
                                const isChecked = selectedDocuments.includes(template.id);
                                return (
                                    <div
                                        key={template.id}
                                        className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            id={`doc-${template.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                                handleDocumentToggle(template.id, checked === true)}
                                            disabled={disabled}
                                        />
                                        <div className="grid gap-0.5">
                                            <Label htmlFor={`doc-${template.id}`} className="cursor-pointer font-medium">
                                                {template.name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">{template.type}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <FieldError id="wizard-documentTemplateIds-error" message={documentError} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">IT Provisioning</CardTitle>
                    <CardDescription>
                        Select the provisioning tasks required for the employee.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {provisioningTaskOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No provisioning tasks configured.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {provisioningTaskOptions.map((option) => {
                                const isChecked = selectedProvisioningTasks.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <Checkbox
                                            id={`task-${option.value}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) =>
                                                handleProvisioningToggle(option.value, checked === true)}
                                            disabled={disabled}
                                        />
                                        <Label htmlFor={`task-${option.value}`} className="cursor-pointer font-medium">
                                            {option.label}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
