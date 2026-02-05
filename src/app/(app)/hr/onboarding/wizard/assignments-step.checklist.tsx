import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';

export interface ChecklistTemplateCardProps {
    values: OnboardingWizardValues;
    checklistTemplates: ChecklistTemplate[];
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    error?: string;
    canManageTemplates?: boolean;
    disabled?: boolean;
}

export function ChecklistTemplateCard({
    values,
    checklistTemplates,
    onValuesChange,
    error,
    canManageTemplates = false,
    disabled = false,
}: ChecklistTemplateCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Onboarding Checklist</CardTitle>
                <CardDescription>
                    Optionally attach a checklist template to guide the employee through onboarding tasks.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                        <div className="text-sm font-medium">Attach checklist template</div>
                        <div className="text-xs text-muted-foreground">
                            {canManageTemplates
                                ? 'The employee will see checklist items upon joining.'
                                : 'You do not have permission to manage templates.'}
                        </div>
                    </div>
                    <Switch
                        checked={values.includeTemplate ?? false}
                        onCheckedChange={(checked) => onValuesChange({ includeTemplate: checked })}
                        disabled={disabled}
                        aria-label="Attach checklist template"
                    />
                </div>

                {values.includeTemplate && (
                    <div className="space-y-2">
                        <Label htmlFor="wizard-onboardingTemplateId">Template</Label>
                        <Select
                            value={values.onboardingTemplateId ?? ''}
                            onValueChange={(value) => onValuesChange({ onboardingTemplateId: value || undefined })}
                            disabled={disabled || !canManageTemplates || checklistTemplates.length === 0}
                        >
                            <SelectTrigger
                                id="wizard-onboardingTemplateId"
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? 'wizard-onboardingTemplateId-error' : undefined}
                            >
                                <SelectValue
                                    placeholder={
                                        checklistTemplates.length === 0
                                            ? 'No templates available'
                                            : 'Select a template'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {checklistTemplates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        <div className="flex flex-col">
                                            <span>{template.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {template.items.length} item{template.items.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError id="wizard-onboardingTemplateId-error" message={error} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
