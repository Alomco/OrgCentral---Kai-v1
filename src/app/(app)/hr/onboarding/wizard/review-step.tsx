'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { OnboardingWizardValues } from './wizard.schema';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import type { LeaveType } from './assignments-step';
import { ReviewAssignmentsSection, ReviewIdentitySection, ReviewJobSection } from './review-sections';

export interface ReviewStepProps {
    values: OnboardingWizardValues;
    checklistTemplates?: ChecklistTemplate[];
    leaveTypes?: LeaveType[];
    onEditStep?: (stepIndex: number) => void;
}

export function ReviewStep({ values, checklistTemplates = [], leaveTypes = [], onEditStep }: ReviewStepProps) {
    const selectedTemplate = checklistTemplates.find((t) => t.id === values.onboardingTemplateId);
    const selectedLeaveTypes = values.eligibleLeaveTypes ?? [];

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Review &amp; Send</h3>
                <p className="text-sm text-muted-foreground">
                    Review the onboarding details before sending the invitation to the employee.
                </p>
            </div>

            <div className="grid gap-4">
                <ReviewIdentitySection values={values} onEditStep={onEditStep} />
                <ReviewJobSection values={values} onEditStep={onEditStep} />
                <ReviewAssignmentsSection
                    values={values}
                    leaveTypes={leaveTypes}
                    selectedLeaveTypes={selectedLeaveTypes}
                    selectedTemplate={selectedTemplate}
                    onEditStep={onEditStep}
                />
            </div>

            {/* Summary */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">What happens next?</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li>- An invitation email will be sent to <strong>{values.email}</strong></li>
                        <li>- The employee will create an account and accept the invitation</li>
                        <li>- Their profile will be set up with the configured details</li>
                        {values.includeTemplate && selectedTemplate && (
                            <li>- The onboarding checklist will be assigned automatically</li>
                        )}
                        {selectedLeaveTypes.length > 0 && (
                            <li>- Leave balances will be initialized for the assigned leave types</li>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
