import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { OnboardingWorkflowTemplateRecord } from '@/server/types/hr/onboarding-workflow-templates';
import type { EmailSequenceTemplateRecord } from '@/server/types/hr/onboarding-email-sequences';

export interface WorkflowEmailCardsProps {
    values: OnboardingWizardValues;
    workflowTemplates: OnboardingWorkflowTemplateRecord[];
    emailSequenceTemplates: EmailSequenceTemplateRecord[];
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    workflowError?: string;
    emailError?: string;
    disabled?: boolean;
}

export function WorkflowEmailCards({
    values,
    workflowTemplates,
    emailSequenceTemplates,
    onValuesChange,
    workflowError,
    emailError,
    disabled = false,
}: WorkflowEmailCardsProps) {
    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Workflow Template</CardTitle>
                    <CardDescription>
                        Choose a workflow template to customize the onboarding stages and approvals.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="wizard-workflowTemplateId">Template</Label>
                    <Select
                        value={values.workflowTemplateId ?? ''}
                        onValueChange={(value) => onValuesChange({ workflowTemplateId: value || undefined })}
                        disabled={disabled || workflowTemplates.length === 0}
                    >
                        <SelectTrigger
                            id="wizard-workflowTemplateId"
                            aria-invalid={Boolean(workflowError)}
                            aria-describedby={workflowError ? 'wizard-workflowTemplateId-error' : undefined}
                        >
                            <SelectValue
                                placeholder={workflowTemplates.length === 0 ? 'No templates available' : 'Select a template'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {workflowTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    <div className="flex flex-col">
                                        <span>{template.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {template.templateType} • v{template.version}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError id="wizard-workflowTemplateId-error" message={workflowError} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Email Sequence</CardTitle>
                    <CardDescription>
                        Select an automated email sequence to guide the employee during onboarding.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="wizard-emailSequenceTemplateId">Sequence</Label>
                    <Select
                        value={values.emailSequenceTemplateId ?? ''}
                        onValueChange={(value) => onValuesChange({ emailSequenceTemplateId: value || undefined })}
                        disabled={disabled || emailSequenceTemplates.length === 0}
                    >
                        <SelectTrigger
                            id="wizard-emailSequenceTemplateId"
                            aria-invalid={Boolean(emailError)}
                            aria-describedby={emailError ? 'wizard-emailSequenceTemplateId-error' : undefined}
                        >
                            <SelectValue
                                placeholder={emailSequenceTemplates.length === 0 ? 'No sequences available' : 'Select a sequence'}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {emailSequenceTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                    <div className="flex flex-col">
                                        <span>{template.name}</span>
                                        <span className="text-xs text-muted-foreground">{template.trigger}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError id="wizard-emailSequenceTemplateId-error" message={emailError} />
                </CardContent>
            </Card>
        </>
    );
}
