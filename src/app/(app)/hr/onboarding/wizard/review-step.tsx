'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { OnboardingWizardValues } from './wizard.schema';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import type { LeaveType } from './assignments-step';
import { ReviewAssignmentsSection, ReviewIdentitySection, ReviewJobSection } from './review-sections';
import type { WizardStepId } from './onboarding-wizard-steps';

export interface ReviewStepProps {
    values: OnboardingWizardValues;
    checklistTemplates?: ChecklistTemplate[];
    leaveTypes?: LeaveType[];
    onEditStep?: (stepIndex: number) => void;
    stepIndexById: Map<string, number>;
}

export function ReviewStep({
    values,
    checklistTemplates = [],
    leaveTypes = [],
    onEditStep,
    stepIndexById,
}: ReviewStepProps) {
    const selectedTemplate = checklistTemplates.find((t) => t.id === values.onboardingTemplateId);
    const selectedLeaveTypes = values.eligibleLeaveTypes ?? [];
    const getStepIndex = (id: WizardStepId) => stepIndexById.get(id);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Review &amp; Send</h3>
                <p className="text-sm text-muted-foreground">
                    Review the invitation details before sending access to the invitee.
                </p>
            </div>

            <div className="grid gap-4">
                <ReviewIdentitySection
                    values={values}
                    onEditStep={onEditStep}
                    stepIndex={getStepIndex('identity')}
                    showEmployeeFields={values.useOnboarding}
                />
                {values.useOnboarding ? (
                    <ReviewJobSection
                        values={values}
                        onEditStep={onEditStep}
                        stepIndex={getStepIndex('job')}
                    />
                ) : null}
                {values.useOnboarding ? (
                    <ReviewAssignmentsSection
                        values={values}
                        leaveTypes={leaveTypes}
                        selectedLeaveTypes={selectedLeaveTypes}
                        selectedTemplate={selectedTemplate}
                        onEditStep={onEditStep}
                        stepIndex={getStepIndex('assignments')}
                    />
                ) : null}
            </div>

            {/* Summary */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">What happens next?</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li>- An invitation email will be sent to <strong>{values.email}</strong></li>
                        <li>- The invitee will create an account and accept the invitation</li>
                        <li>- Access will be granted with the <strong>{values.role}</strong> role</li>
                        {values.useOnboarding ? (
                            <li>- An employee profile will be created with the supplied onboarding details</li>
                        ) : null}
                        {values.useOnboarding && values.includeTemplate && selectedTemplate ? (
                            <li>- The onboarding checklist will be assigned automatically</li>
                        ) : null}
                        {values.useOnboarding && selectedLeaveTypes.length > 0 ? (
                            <li>- Leave balances will be initialized for the assigned leave types</li>
                        ) : null}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
