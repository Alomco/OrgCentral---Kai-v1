'use client';

import { ChecklistTemplateCard } from './assignments-step.checklist';
import { LeaveTypesCard } from './assignments-step.leave-types';
import { WorkflowEmailCards } from './assignments-step.workflow-email';
import { DocumentsProvisioningCards } from './assignments-step.documents-provisioning';
import type { OnboardingWizardValues } from './wizard.schema';
import type { FieldErrors } from '../../_components/form-errors';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import type { OnboardingWorkflowTemplateRecord } from '@/server/types/hr/onboarding-workflow-templates';
import type { EmailSequenceTemplateRecord } from '@/server/types/hr/onboarding-email-sequences';
import type { DocumentTemplateRecord } from '@/server/types/records/document-templates';
import type { LeaveTypeOption } from '@/server/types/hr/leave-type-options';

export type LeaveType = LeaveTypeOption;

export interface AssignmentsStepProps {
    values: OnboardingWizardValues;
    fieldErrors?: FieldErrors<OnboardingWizardValues>;
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    leaveTypes?: LeaveType[];
    checklistTemplates?: ChecklistTemplate[];
    workflowTemplates?: OnboardingWorkflowTemplateRecord[];
    emailSequenceTemplates?: EmailSequenceTemplateRecord[];
    documentTemplates?: DocumentTemplateRecord[];
    provisioningTaskOptions?: { value: string; label: string }[];
    canManageTemplates?: boolean;
    disabled?: boolean;
}

export function AssignmentsStep({
    values,
    fieldErrors,
    onValuesChange,
    leaveTypes = [],
    checklistTemplates = [],
    workflowTemplates = [],
    emailSequenceTemplates = [],
    documentTemplates = [],
    provisioningTaskOptions = [],
    canManageTemplates = false,
    disabled = false,
}: AssignmentsStepProps) {
    const leaveTypesError = fieldErrors?.eligibleLeaveTypes;
    const templateError = fieldErrors?.onboardingTemplateId;
    const workflowTemplateError = fieldErrors?.workflowTemplateId;
    const emailSequenceError = fieldErrors?.emailSequenceTemplateId;
    const documentTemplateError = fieldErrors?.documentTemplateIds;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Assignments</h3>
                <p className="text-sm text-muted-foreground">
                    Configure which leave types the employee is eligible for and assign an onboarding checklist.
                </p>
            </div>
            <LeaveTypesCard
                values={values}
                leaveTypes={leaveTypes}
                onValuesChange={onValuesChange}
                error={leaveTypesError}
                disabled={disabled}
            />
            <ChecklistTemplateCard
                values={values}
                checklistTemplates={checklistTemplates}
                onValuesChange={onValuesChange}
                error={templateError}
                canManageTemplates={canManageTemplates}
                disabled={disabled}
            />
            <WorkflowEmailCards
                values={values}
                workflowTemplates={workflowTemplates}
                emailSequenceTemplates={emailSequenceTemplates}
                onValuesChange={onValuesChange}
                workflowError={workflowTemplateError}
                emailError={emailSequenceError}
                disabled={disabled}
            />
            <DocumentsProvisioningCards
                values={values}
                documentTemplates={documentTemplates}
                provisioningTaskOptions={provisioningTaskOptions}
                onValuesChange={onValuesChange}
                documentError={documentTemplateError}
                disabled={disabled}
            />
        </div>
    );
}
